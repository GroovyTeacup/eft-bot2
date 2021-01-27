/// <reference path="../typings/eft.d.ts">/>

const { Command, TypeResolver } = require('discord-akairo');
const ContentParser = require('discord-akairo/src/struct/commands/ContentParser');
const { MessageEmbed } = require('discord.js');
const { GuildMember, User } = require('discord.js');
const EFTMessage = require('../eftMessage');
const embedHelper = require("../embedHelper")

class UnmuteCommand extends Command {
    constructor() {
        super('unmute', {
           aliases: ['unmute'],
           args: [
               {
                   id: "target",
                   type: "member"
               }
           ],
           clientPermissions: ["SEND_MESSAGES", "MANAGE_MESSAGES"],
           channel: "guild",
           typing: false
        });
    }
    
    /**
     *
     *
     * @param {EFTMessage} message
     * @param {Object} obj
     * @param {GuildMember} obj.target
     * @returns
     * @memberof UnmuteCommand
     */
    async exec(message, { target }) {
        let muteHandler = message.client.muteHandler
        let issuer = message.member

        if (!message.client.isStaffMember(issuer)) return

        if (target == null)
        {
            return await message.reply(`Couldn't find that member.\nUsage: \`!mute <Discord Member Name/Mention/ID> <Duration>\` `)
        }

        if (!target.bannable || issuer.roles.highest.position < target.roles.highest.position)
        {
            return await message.reply(embedHelper.makeError(this.client, "You are not allowed to unmute this member.", "Unmute failed"))
        }

        if (!muteHandler.isMemberMuted(target.id))
        {
            return await message.reply(embedHelper.makeError(this.client, "This member is not muted!", "Unmute failed"))
        }

        await muteHandler.unmuteMember(target.id)

        await message.reply(embedHelper.makeSuccess(this.client, `Unmuted discord member ${target} with ID \`${target.id}\`` , "Unmuted member " + target.displayName))
        await message.client.logBotAction(embedHelper.makeSuccess(this.client, `${issuer} has unmuted the discord member ${target}.`, "Unmuted member " + target.displayName))
        console.log(`${issuer.id} unmuted the discord member ${target.id}.`)
        this.handler.emit("memberUnmuted", target, issuer)
    }
}

module.exports = UnmuteCommand;