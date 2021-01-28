/// <reference path="../typings/eft.d.ts">/>

const { Command } = require('discord-akairo');
const { Duration } = require("luxon")
const embedHelper = require("../embedHelper")
const EFTMessage = require('../eftMessage');


class StatusCommand extends Command {
    constructor() {
        super('status', {
           aliases: ["status"],
           clientPermissions: ["SEND_MESSAGES"],
           channel: "guild",
           typing: false,
        });
    }

    parseUptime(ms)
    {
        let str = ""
        let duration = Duration.fromMillis(ms).shiftTo('weeks', 'days', 'hours', 'minutes', 'seconds')

        if (duration.weeks > 0) str += `${duration.weeks}w `
        if (duration.days > 0) str += `${duration.days}d `

        str += `${duration.hours}h `
        str += `${duration.minutes}m `
        str += `${Math.floor(duration.seconds)}s`

        return str
    }

    /**
     *
     *
     * @param {EFTMessage} message
     * @returns
     * @memberof StatusCommand
     */
    async exec(message) {
        if (!message.member.hasPermission("ADMINISTRATOR") && message.member.id != 178145436559867904) return

        let client = message.client
        let server = client.getGuild()
        let dbHandler = client.databaseHandler
        let muteHandler = client.muteHandler

        let embed = embedHelper.makeSimpleEmbed(this.client, "", `EFTBot v${client.botVersion} Status`, 0xffa500)

        let members = await dbHandler.getMembers() || []
        let warnCount = await dbHandler.warns.count()
        let banCount = await dbHandler.bans.count()
        let membersCount = members.length

        let totalRep = 0
        members.forEach(x => totalRep += x.reputation)

        embed.addField("Server ID", server.id, true)
        embed.addField("Bot User ID", client.user.id, true)
        embed.addField("Uptime", this.parseUptime(client.uptime), true)
        embed.addField("Websocket Gateway", client.ws.gateway, true)
        embed.addField("Websocket Intent Flags", client.options.ws.intents, true)
        embed.addField("Websocket Ping", client.ws.ping, true)
        embed.addField("Registered Members", membersCount, true)
        embed.addField("Member Cache", server.members.cache.size, true)
        embed.addField("Muted Members", Object.keys(muteHandler.mutedMembers).length, true)
        
        embed.addField("Total Reputation", totalRep, true)   
        embed.addField("Warnings", warnCount, true)
        embed.addField("Bans", banCount, true)

        embed.setThumbnail(server.iconURL())

        await message.reply(embed)
    }
}

module.exports = StatusCommand;