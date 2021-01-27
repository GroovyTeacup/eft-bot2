const EFTClient = require("./eftClient")
const { MessageEmbed, Message } = require("discord.js")
const { TextChannel } = require("discord.js")
const { GuildMember } = require("discord.js")
const { DateTime } = require("luxon")
const embedHelper = require("./embedHelper")

/**
 *
 * @class MiddlemanBoardHandler
 */
class MiddlemanBoardHandler {
    /**
     * Creates an instance of MiddlemanBoardHandler.
     * @param {EFTClient} client
     * @memberof MiddlemanBoardHandler
     */
    constructor(client) {
        this.client = client
        this.dbHandler = client.databaseHandler

        // Update delay in minutes
        //let delay = client.config.MMBoardUpdateDelay 
        let roleId = client.configServer.MiddlemanRole 
        let channelId = client.configServer.MiddlemanBoardChannel 
        
        client.addListener("ready", async () => {
            let guild = client.getGuild()
            let boardChannel = client.util.resolveChannel(channelId, guild.channels.cache)
            let boardRole = client.util.resolveRole(roleId, guild.roles.cache)

            /** @type {TextChannel} */
            this.boardChannel = boardChannel
            this.boardRole = boardRole


            if (boardChannel == null)
            {
                return console.error(`Couldn't find middleman board channel (${channelId}). Middleman board will not work.`)
            }

            if (boardRole == null)
            {
                return console.error(`Couldn't find middleman role (${roleId}). Middleman board will not work.`)
            }

            // Fetch messages in this channel
            let messages = await this.boardChannel.messages.fetch({limit: 10, force: true})
            
            let boardMessage = null

            // Loop through every message we got and check to see if it's a message by this bot
            messages.forEach((message) => {
                if (message.author.id === this.client.user.id)
                {
                    console.log("Found middleman board message", message.id)
                    boardMessage = message
                    return
                }
            })

            // If we can't find the stats message, let's create a new one87
            if (boardMessage == null)
            {
                console.warn("Couldn't find server stats embed; Making a new one.")
            }

            /** @type {Message} */
            this.boardMessage = boardMessage

            this.boardUpdateTimer = setInterval(() => this.updateBoardMessage(this), 1000 * 60 * 60)
            this.updateBoardMessage(this)
        })
    }

    async createBoardMessage(handler)
    {
        let channel = handler.boardChannel
        return await channel.send(embedHelper.makeError(handler.client, "Placeholder board embed", "Placeholder"))
    }

    /**
     *
     *
     * @param {MiddlemanBoardHandler} handler
     * @memberof MiddlemanBoardHandler
     */
    async updateBoardMessage(handler)
    {
        let guild = handler.client.getGuild()
        let dbHandler = handler.dbHandler
        let message = handler.boardMessage

        if (message == null || message.deleted)
        {
            // Create stats message if the previous one was deleted or can't be found for some reason.
            handler.boardMessage = await handler.createBoardMessage(handler)
            message = handler.boardMessage
            console.log("Couldn't find old middleman board message; Created new one.")
        }

        let fetch = await guild.members.fetch({force: true, query: "*"}).catch((err) => console.error(`Failed to fetch guild members for board message. (${err})`))
        if (fetch == null) return

        let role = await guild.roles.fetch(handler.client.configServer.MiddlemanRole, true, true)
        let members = (await guild.members.fetch()).filter(member => member.roles.cache.has(role.id)).map(member => member) // Fetch all guild members and filter by role (This should only run every hour at minimum)

        let dbMembers = []
        for (const member of members)
        {
            dbMembers.push(await dbHandler.getMemberById(member.id))
        }

        dbMembers.sort((a, b) => b.mm_reputation - a.mm_reputation)

        let embed = embedHelper.makeSuccess(this.client, "", "Middleman Reputation Leaderboard")
        let txt = ""
        let count = 1
        for (const dbMember of dbMembers)
        {
            txt += `\n**${count}**. <@${dbMember.member_id}>\n${dbMember.mm_reputation}\n`
            count++
        }

        embed.setDescription(txt)
        handler.boardMessage = await message.edit(embed)
        console.log("Updated board message")
    }
}

module.exports = MiddlemanBoardHandler