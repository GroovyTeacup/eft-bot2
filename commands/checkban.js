/// <reference path="../typings/eft.d.ts">/>

const { Command, TypeResolver } = require('discord-akairo');
const ContentParser = require('discord-akairo/src/struct/commands/ContentParser');
const { User } = require('discord.js');
const { GuildMember } = require('discord.js');
const EFTMessage = require('../eftMessage');
const embedHelper = require("../embedHelper")

class CheckBanCommand extends Command {
    constructor() {
        super('checkBan', {
           aliases: ["checkban"],
           clientPermissions: ["SEND_MESSAGES", "BAN_MEMBERS", "VIEW_AUDIT_LOG"],
           args: [
               {
                   id: "userId",
                   type: "string"
               }
           ],
           channel: "guild",
           typing: false,
        });
    }
    /**
     *
     *
     * @param {EFTMessage} message
     * @param {string} userId
     * @returns
     * @memberof CheckBanCommand
     */
    async exec(message, { userId }) {
        if (!message.client.isStaffMember(issuer)) return
        
        let server = message.client.getGuild()
        let user = await message.client.users.fetch(userId, false, true).catch((reason) => {
            console.error(`${message.author.id} tried to check ban info for a user with id ${userId} but failed to fetch user.`)
        })

        if (user == null)
        {
            return await message.reply(embedHelper.makeError(this.client, "Failed to find any discord user with the ID " + userId, "No user found"))
        }

        let ban = await server.fetchBan(user).catch((err) => console.error(`Failed to fetch ban info for user ${userId}. Doesn't exist.`))
        if (ban == null)
        {
            return await message.reply(embedHelper.makeError(this.client, `Failed to get any ban information for user id ${userId}.\nAre you sure this user is banned?`))
        }
        
        let reason = ban.reason
        let issuer

        let patt = /Issuer: ([\S]+) \((.+)\)/ims
        if (reason.startsWith("Issuer:") && patt.test(reason.trim()))
        {
            let groups = patt.exec(reason.trim())
            issuer = groups[1]
            reason = groups[2]
        }

        let embed = embedHelper.makeSimpleEmbed(this.client, "", `Banned user ${user.username}#${user.discriminator}`, 0xffa500)
        .setThumbnail(user.avatarURL())

        if (issuer)
        {
            embed.addField("Issuer", issuer)
        }
        embed.addField("Reason", `\`\`\`\n${reason || "No reason provided."}\n\`\`\``)

        

        await message.reply(embed)
    }
}

module.exports = CheckBanCommand;