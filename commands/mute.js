/// <reference path="../typings/eft.d.ts">/>

const { Command, TypeResolver } = require('discord-akairo');
const ContentParser = require('discord-akairo/src/struct/commands/ContentParser');
const { MessageEmbed } = require('discord.js');
const { GuildMember, User } = require('discord.js');
const EFTMessage = require('../eftMessage');
const embedHelper = require("../embedHelper")

class MuteCommand extends Command {
    constructor() {
        super('mute', {
           aliases: ['mute'],
           args: [
               {
                   id: "target",
                   type: "member"
               },
               {
                id: "duration",
                type: "number"
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
     * @param {GuildMember} message
     * @returns
     * @memberof MuteCommand
     */
    async parse(message)
    {
        let ret = {target: null, duration: null, suffix: null}

        let parser = new ContentParser()
        let resolver = new TypeResolver(this.handler)
        let resolveMember = resolver.type("member")

        let args = parser.parse(message.content).all
        if (args.length >= 2)
        {
            let idStr = args[1].value
            ret.target = resolveMember(message, idStr)

            if (args.length >= 3)
            {
                let str = args[2].value
                
                if (str.trim().length > 0 && Number(str))
                {
                    ret.duration = Number(str)
                }
                else
                {
                    let suffix = str.slice(-1)
                    str = str.substr(0, str.length - 1)

                    if (str.trim().length > 0 && Number(str))
                    {
                        ret.duration = Number(str)
                        ret.suffix = suffix
                    }
                }
            }
        }

        return ret
    }
    
    /**
     *
     *
     * @param {EFTMessage} message
     * @param {Object} obj
     * @param {GuildMember} obj.target
     * @param {number} obj.duration
     * @returns
     * @memberof MuteCommand
     */
    async exec(message, { target, duration, suffix }) {
        let muteHandler = message.client.muteHandler
        let issuer = message.member

        if (!message.client.isStaffMember(issuer)) return

        if (target == null)
        {
            return await message.reply(`Couldn't find that member.\nUsage: \`!mute <Discord Member Name/Mention/ID> <Duration In Minutes>\` `)
        }

        if (!target.bannable || issuer.roles.highest.position < target.roles.highest.position)
        {
            return await message.reply(embedHelper.makeError(this.client, "You are not allowed to mute this member.", "Mute failed"))
        }

        if (duration == null || duration <= 0)
        {
            return await message.reply(embedHelper.makeError(this.client, "Please enter a valid mute duration.", "Mute failed"))
        }

        if (muteHandler.isMemberMuted(target.id))
        {
            return await message.reply(embedHelper.makeError(this.client, "This member is already muted!", "Mute failed"))
        }

        let minutes = duration

        switch (suffix)
        {
            case "m":
                break;
            case "h":
                minutes = 60 * duration
                break
            case "d":
                minutes = 60 * 24 * duration
                break
            case "w":
                minutes = 60 * 24 * 7 * duration
                break
            default:
                if (suffix == null) break
                return await message.reply(embedHelper.makeError(this.client, "Please enter a valid mute duration.", "Mute failed"))
        }

        await muteHandler.muteMember(target.id, minutes, issuer.id)

        await message.reply(embedHelper.makeSuccess(this.client, `Muted discord member ${target} with ID \`${target.id}\`\nDuration: \`${minutes}\` minutes` , "Muted member " + target.displayName))
        await message.client.logBotAction(embedHelper.makeSuccess(this.client, `${issuer} has muted the discord member ${target}.\nDuration: \`${minutes}\` minutes`, "Muted member " + target.displayName))
        console.log(`${issuer.id} muted the discord member ${target.id} for ${minutes} minutes.`)
        this.handler.emit("memberMuted", target, issuer, minutes)
    }
}

module.exports = MuteCommand;