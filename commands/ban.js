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
           clientPermissions: ["BAN_MEMBERS", "SEND_MESSAGES"],
           /*args: [
               {
                   id: "target",
                   type: "member"
               }
           ],*/
           channel: "guild",
           typing: true,
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
     * @param {number} args.duration
     * @param {sting} args.reason
     * @param {boolean} args.isID
     * @returns
     * @memberof BanCommand
     */
    async exec(message, args) {
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
            if (!args.target.bannable)
            {
                return await embedHelper.makeError(this.client, "You are not allowed to ban this member.", "Ban failed")
            }

            id = args.target.id
        }

        if (args.duration > 7)
        {
            return await embedHelper.makeError(this.client, "Specify a ban duration less or equal to 7 days. 0 days for a permanent ban.", "ban failed")
        }

        let user = await message.client.users.fetch(id, false, true).catch((reason) => {
            console.error(`${message.author.id} tried to ban a user with id ${id} but failed to fetch.`)
        })

        if (user == null)
        {
            return await message.reply(embedHelper.makeError(this.client, "Failed to find any discord user with the ID " + id, "No user found"))
        }

        await message.guild.members.ban(id)
        await message.reply(embedHelper.makeSuccess(this.client, `Banned discord member ${user.username}#${user.discriminator} with ID ${id}` , "Banned member " + user.username))
        this.handler.emit("memberBanned", user, message.member, args.duration, args.reason)
        console.log(`${message.author.id} issued a ban to discord member ${id}. Duration: ${args.duration}`)
    }
}

module.exports = BanCommand;