/// <reference path="../typings/eft.d.ts">/>

const { Command, TypeResolver } = require('discord-akairo');
const ContentParser = require('discord-akairo/src/struct/commands/ContentParser');
const { User } = require('discord.js');
const { GuildMember } = require('discord.js');
const EFTMessage = require('../eftMessage');
const embedHelper = require("../embedHelper")

class BanCommand extends Command {
    constructor() {
        super('ban', {
           aliases: ['ban'],
           clientPermissions: ["BAN_MEMBERS", "SEND_MESSAGES", "MENTION_EVERYONE"],
           /*args: [
               {
                   id: "target",
                   type: "member"
               }
           ],*/
           channel: "guild",
           typing: false,
        });
    }

    /**
     * Parses content using the command's arguments.
     * This function is a clusterfuck and pretty un-necessary lmao
     * @param {EFTMessage} message
     * @memberof BanCommand
     */
    async parse(message)
    {
        let ret = {target: null, pruneDuration: 0, reason: "No reason specified.", isID: false}

        let parser = new ContentParser()
        let resolver = new TypeResolver(this.handler)
        let resolveMember = resolver.type("member")

        let args = parser.parse(message.content).all
        if (args.length >= 2)
        {
            let idStr = args[1].value
            let member = resolveMember(message, idStr)

            // If the argument can't be parsed as a regular guild member, string isn't empty, and the string is *only* a number, pass the number to exec as an id
            if (member == null)
            {
                if (idStr != null && idStr.length > 0 && Number(idStr))
                { 
                    ret.target = idStr
                    ret.isID = true
                }
            }
            else
            {
                ret.target = member
            }

            if (args.length >= 3)
            {
                // What index the ban reason string will start at
                let reasonStart = 2

                let str = args[2].value
                if (str.length > 0 && Number(str))
                {
                    ret.pruneDuration = Number(str)
                    reasonStart = 3
                }
                else
                {
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
        }

        return ret
    }
    
    /**
     *
     *
     * @param {EFTMessage} message
     * @param {object} args
     * @param {GuildMember|string} args.target
     * @param {number} args.pruneDuration
     * @param {sting} args.reason
     * @param {boolean} args.isID
     * @returns
     * @memberof BanCommand
     */
    async exec(message, args) {
        if (!message.client.isStaffMember(message.member)) return

        if (args.target == null)
        {
            return await message.reply(`Couldn't find that member.\nUsage: \`!ban <Discord Member Name/Mention/ID> [Duration] [Ban Reason]\` `)
        }

        let id

        if (args.isID)
        {
            id = args.target
        }
        else
        {
            if (!args.target.bannable || message.member.roles.highest.position < args.target.roles.highest.position)
            {
                return await message.reply(embedHelper.makeError(this.client, "You are not allowed to ban this member.", "Ban failed"))
            }

            id = args.target.id
        }

        if (args.pruneDuration > 7)
        {
            return await message.reply(embedHelper.makeError(this.client, "Specify a pruning duration less or equal to 7 days. 0 days for no message pruning.", "Ban failed"))
        }

        let user = await message.client.users.fetch(id, false, true).catch((reason) => {
            console.error(`${message.author.id} tried to ban a user with id ${id} but failed to fetch.`)
        })

        if (user == null)
        {
            return await message.reply(embedHelper.makeError(this.client, "Failed to find any discord user with the ID " + id, "No user found"))
        }

        // Cut off ban reason if too long
        // This accounts for the max discord username length as well as the other misc text we put in the ban reason
        // Max ban reason length is 512 chars
        if (args.reason.length > 466)
        {
            args.reason = args.reason.substr(0, 466) + "..."
        }

        let ban = message.guild.fetchBan(user.id).catch(reason => {})
        if (ban != null)
        {
            return await message.reply(embedHelper.makeError(this.client, "This user is already banned!", "Ban failed"))
        }

        await message.guild.members.ban(id, {
            days: args.pruneDuration,
            reason: `Issuer: ${message.author.username} (${args.reason})`
        })

        await message.reply(embedHelper.makeSuccess(this.client, `Banned discord member \`${user.username}#${user.discriminator}\` with ID \`${id}\`\nReason: \`${args.reason}\`` , "Banned member " + user.username))
        await message.client.logBotAction(embedHelper.makeSuccess(this.client, `${message.author} has banned the discord member ${user}.\nReason: \`${args.reason}\``), "Banned member " + user.username)
        console.log(`${message.author.id} issued a ban to discord member ${id}. Prune Duration: ${args.pruneDuration}`)
        this.handler.emit("memberBanned", user, message.member, args.pruneDuration, args.reason, false)
    }
}

module.exports = BanCommand;