/// <reference path="../typings/eft.d.ts">/>

const { Command, TypeResolver } = require('discord-akairo');
const ContentParser = require('discord-akairo/src/struct/commands/ContentParser');
const { MessageEmbed } = require('discord.js');
const { GuildMember, User } = require('discord.js');
const EFTMessage = require('../eftMessage');
const embedHelper = require("../embedHelper")

class WarnCommand extends Command {
    constructor() {
        super('warn', {
           aliases: ['warn', 'addwarn'],
           args: [
               {
                   id: "target",
                   type: "member"
               }
           ],
           clientPermissions: ["BAN_MEMBERS", "SEND_MESSAGES"],
           channel: "guild",
           typing: false
        });
    }

    /**
     * Parses content using the command's arguments.
     * This function is a clusterfuck and pretty un-necessary lmao
     * @param {EFTMessage} message
     * @memberof WarnCommand
     */
    async parse(message)
    {
        let ret = {target: null, reason: null}

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
                // What index the warn reason string will start at
                let reasonStart = 2

                let reason = ""
                for (let i = reasonStart; i < args.length; i++)
                {
                    let part = args[i].raw
                    reason += part
                }

                if (reason.length > 0)
                {
                    ret.reason = reason
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
     * @param {string} obj.reason
     * @returns
     * @memberof WarnCommand
     */
    async exec(message, { target, reason }) {
        let dbHandler = message.client.databaseHandler
        let issuer = message.member

        if (!message.client.isStaffMember(issuer)) return

        if (target == null)
        {
            return await message.reply(`Couldn't find that member.\nUsage: \`!warn <Discord Member Name/Mention/ID> <Warn Reason>\` `)
        }

        if (reason == null)
        {
            return await message.reply("Please enter a reason for the warning.")
        }

        if (reason.length > 200)
        {
            return await message.reply(`Please enter a warn reason no longer than 200 characters. (Yours is ${reason.length})`)
        }

        if (!target.bannable || issuer.roles.highest.position < target.roles.highest.position)
        {
            return await message.reply(embedHelper.makeError(this.client, "You are not allowed to warn this member.", "Warn failed"))
        }

        await dbHandler.addWarn(target.id, issuer.id, reason)

        await message.reply(embedHelper.makeSuccess(this.client, `Warned discord member ${target} with ID \`${target.id}\`\nReason: \`${reason}\`` , "Warned member " + target.displayName))
        await message.client.logBotAction(embedHelper.makeSuccess(this.client, `${issuer} has warned the discord member ${target}.\nReason: \`${reason}\``, "Warned member " + target.displayName))
        console.log(`${issuer.id} issued a warning to discord member ${target.id}.`)
        this.handler.emit("memberWarned", target, issuer, reason)
    }
}

module.exports = WarnCommand;