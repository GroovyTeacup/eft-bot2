/// <reference path="../typings/eft.d.ts">/>

const { Command, TypeResolver } = require('discord-akairo');
const ContentParser = require('discord-akairo/src/struct/commands/ContentParser');
const { User } = require('discord.js');
const { GuildMember } = require('discord.js');
const EFTMessage = require('../eftMessage');
const embedHelper = require("../embedHelper")

class BanScammerCommand extends Command {
    constructor() {
        super('banscammer', {
           aliases: ['banscammer'],
           clientPermissions: ["BAN_MEMBERS", "SEND_MESSAGES"],
           channel: "guild",
           typing: true,
        });
    }

    /**
     * Parses content using the command's arguments.
     * This function is a clusterfuck and pretty un-necessary lmao
     * @param {EFTMessage} message
     * @memberof BanScammerCommand
     */
    async parse(message)
    {
        let ret = {target: null, pruneDuration: 0, reason: "No reason specified.", gameName: null, isID: false}

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
                let gameName = args[2].value
                if (gameName != null && gameName.length > 0)
                {
                    console.log("ok gamename", gameName)
                    ret.gameName = gameName
                }

                if (args.length >= 4) {
                    // What index the ban reason string will start at
                    let reasonStart = 3

                    let str = args[3].value
                    if (str.length > 0 && Number(str)) {
                        ret.pruneDuration = Number(str)
                        reasonStart = 4
                    } else {
                        let reason = ""
                        for (let i = reasonStart; i < args.length; i++) {
                            let part = args[i].raw
                            reason += part
                        }

                        if (reason.length > 0) {
                            ret.reason = reason
                        }
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
     * @param {sting} args.gameName
     * @param {boolean} args.isID
     * @returns
     * @memberof BanScammerCommand
     */
    async exec(message, args) {
        if (args.target == null)
        {
            return await message.reply(`Couldn't find that member.\nUsage: \`!banscammer <Discord Member Name/Mention/ID> <In-Game Name> [Duration] [Ban Reason]\` `)
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

        if (args.pruneDuration > 7)
        {
            return await embedHelper.makeError(this.client, "Specify a prune duration less or equal to 7 days. 0 days no message pruning.", "Ban failed")
        }

        if (args.gameName == null)
        {
            return await message.reply(embedHelper.makeError(this.client, "Please specify an in-game name for the scammer."))
        }

        let user = await message.client.users.fetch(id, false, true).catch((reason) => {
            console.error(`${message.author.id} tried to ban a user for scamming with id ${id} but failed to fetch.`)
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

        await message.guild.members.ban(id, {
            days: args.pruneDuration,
            reason: `Issuer: ${message.author.username} (${args.reason})`
        })

        await message.guild.members.ban(id)
        await message.reply(embedHelper.makeSuccess(this.client, `Banned discord member \`${user.username}#${user.discriminator}\` with ID \`${id}\`\n In-Game Name: \`${args.gameName}\`\nReason: \`${args.reason}\`` , "Banned scammer " + user.username))
        console.log(`${message.author.id} issued a ban for scamming to discord member ${id}. GameName: ${args.gameName} Prune Duration: ${args.pruneDuration}`)
        this.handler.emit("memberBanned", user, message.member, args.pruneDuration, args.reason)
        this.handler.emit("memberBannedScammer", user, message.member, args.gameName, args.pruneDuration, args.reason)
    }
}

module.exports = BanScammerCommand;