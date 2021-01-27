/// <reference path="../typings/eft.d.ts">/>

const { Command, TypeResolver } = require('discord-akairo');
const ContentParser = require('discord-akairo/src/struct/commands/ContentParser');
const { MessageEmbed } = require('discord.js');
const { GuildMember, User } = require('discord.js');
const EFTMessage = require('../eftMessage');
const embedHelper = require("../embedHelper")

class ShowWarningsCommand extends Command {
    constructor() {
        super('showWarns', {
           aliases: ['warns', 'showwarns', 'warnings'],
           args: [
               {
                   id: "target",
                   type: "member"
               }
           ],
           clientPermissions: ["SEND_MESSAGES"],
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
     * @memberof ShowWarningsCommand
     */
    async exec(message, { target }) {
        let dbHandler = message.client.databaseHandler
        let issuer = message.member

        if (!message.client.isStaffMember(issuer)) return

        if (target == null)
        {
            return await message.reply(`Couldn't find that member.\nUsage: \`!warns <Discord Member Name/Mention/ID>\` `)
        }

        let warns = await dbHandler.getWarns(target.id)

        if (warns == null || warns.length == 0)
        {
            return await message.reply(embedHelper.makeError(this.client, `${target} has no active warnings.`))
        }

        let embed = embedHelper.makeSimpleEmbed(this.client, `Showing ${warns.length} warnings for the member ${target}`, `Warns for ${target.displayName} (${warns.length})`)
        embed.setColor(0xffa500)
        
        let num = 1
        for (const warn of warns)
        {
            embed.addField(`${num}. Issuer`, `<@${warn.issuer_id}>`, true)
            embed.addField("Issued Date", warn.issued_date.toString(), true)
            embed.addField(`Reason`, `\`\`\`\n${warn.reason}\`\`\``, false)

            num++
        }

        //embed.setImage(target.user.avatarURL({size: 32}))
        
        await message.reply(embed)
    }
}

module.exports = ShowWarningsCommand;