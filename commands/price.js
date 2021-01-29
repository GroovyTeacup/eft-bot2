const fs = require("fs") 
const { Command } = require('discord-akairo');
const { Message } = require("discord.js");
const EFTMessage = require("../eftMessage");
const embedHelper = require("../embedHelper")
const superagent = require("superagent")
const { Duration, DateTime } = require("luxon")
const ContentParser = require('discord-akairo/src/struct/commands/ContentParser');


class PriceCommand extends Command {
    constructor() {
        super('price', {
           aliases: ['p','price'],
           description: "Get the price of an an EFT item using data from the tarkov-market.com API",
           cooldown: 5000,
           ratelimit: 3,
           args: [
               {
                   id: "search",
                   type: "string"
               }
           ],
           clientPermissions: ["ADMINISTRATOR"],
           channel: "guild"
        });
    }

    parseUpdateTime(timeStr)
    {
        let str = ""
        let time = DateTime.fromISO(timeStr)
        console.log(time)
        let duration = Duration.fromMillis(Date.now() - time.toJSDate()).shiftTo('weeks', 'days', 'hours', 'minutes', 'seconds')

        if (duration.weeks > 0) str += `${duration.weeks}w `
        if (duration.days > 0) str += `${duration.days}d `
        if (duration.hours > 0) str += `${duration.hours}h `
        if (duration.minutes > 0) str += `${duration.minutes}m `

        str += `${Math.floor(duration.seconds)}s ago`

        return str
    }

    async parse(message)
    {
        let ret = {search: null}

        let parser = new ContentParser()

        let args = parser.parse(message.content).all
        if (args.length > 1)
        {
            let search = ""
            for (let i = 1; i < args.length; i++)
            {
                let part = args[i].raw
                search += part
            }

            if (search.length > 0)
            {
                ret.search = search
            }
        }

        return ret
    }

    /**
     *
     *
     * @param {EFTMessage} message
     * @param {Object} args
     * @param {string} args.search
     * @returns
     * @memberof PriceCommand
     */
    async exec(message, {search}) {
       let key = message.client.config.MarketAPIKey

       let data = await superagent.get("https://tarkov-market.com/api/v1/item")
       .query({
           q: search
       })
       .set("accept", "application/json")
       .set("x-api-key", key)
       .set("UserAgent", "Discord-EFTBot/" + message.client.botVersion)
       .timeout({
           response: 5000,
           deadline: 10000
       })
       .catch((reason) => console.error(`Failed while querying tarkov-market for "${search}": ${reason} by user ${message.author.id}`))

       if (data == null)
       {
           return await message.reply(embedHelper.makeError(this.client, "Failed to query tarkov market with that search term. Try again?", "API Request Failed"))
       }

       if (!data.ok)
       {
           return await message.reply(embedHelper.makeError(this.client, `Market API returned a ${data.status} status code`, "API Request Failed"))
       }

       let result = data.body

       //console.log("JSON:\n", result)

       if (result.length == 0)
       {
            return await message.reply(embedHelper.makeError(this.client, `No items found with the search term "${search}".`, "No items found"))
       }

       if (result.length > 1)
       {
           let embed = embedHelper.makeError(this.client, "", `Multiple items found (${result.length}):`)
           let str = ""

           for (const item of result)
           {
                str += "> " + item.name + "\n"
           }

           str += "\nSpecify your search request"

           embed.setDescription(str)

           return await message.reply(embed)
       }

       let item = result[0]
       
       let embed = embedHelper.makeSimpleEmbed(this.client, "", "")

       let fakeFooter = `[Wiki](${item.wikiLink})`

       embed.addField("Price", `**${item.price}${item.traderPriceCur}**\n(*lowest price*)`, true)
       embed.addField("Price Per Slot", `**${item.price / item.slots}${item.traderPriceCur}**\n(*${item.slots} slots*)`, true)
       embed.addField("Price Difference", `1 day: **${item.diff24h}%**\n7 days: **${item.diff7days}%**`, true)
       embed.addField(item.traderName, `**${item.traderPrice}${item.traderPriceCur}**\n(*Highest buy back price by trader*)\n\n${fakeFooter}`, true)

       embed.setAuthor(item.name, "https://tarkov-market.com/_nuxt/icons/icon_512x512.e2f01c.png", item.link)
       embed.setThumbnail(item.img)


       embed.setFooter(`Price updated ${this.parseUpdateTime(item.updated)}`)
       embed.setTimestamp(null)
       embed.setColor(0x000000)

       return await message.reply(embed)
    }
}

module.exports = PriceCommand;