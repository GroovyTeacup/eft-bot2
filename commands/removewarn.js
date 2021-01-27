/// <reference path="../typings/eft.d.ts">/>

const { Command, TypeResolver } = require('discord-akairo');
const ContentParser = require('discord-akairo/src/struct/commands/ContentParser');
const { MessageEmbed } = require('discord.js');
const { GuildMember, User } = require('discord.js');
const EFTMessage = require('../eftMessage');
const embedHelper = require("../embedHelper")

class RemoveWarningCommand extends Command {
    constructor() {
        super('removeWarn', {
           aliases: ['rmwarn', 'removewarn', 'removewarning'],
           args: [
               {
                   id: "target",
                   type: "member"
               },
               {
                   id: "num",
                   type: "number"
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
     * @memberof RemoveWarningCommand
     */
    async exec(message, { target, num }) {
        let dbHandler = message.client.databaseHandler
        let issuer = message.member

        if (!message.client.isStaffMember(issuer)) return

        if (target == null)
        {
            return await message.reply(`Couldn't find that member.\nUsage: \`!rmwarn <Warn Number>\` `)
        }

        if (num == null)
        {
            return await message.reply(`Invalid warn number.\nUsage: \`!rmwarn <Warn Number>\` `)
        }

        let warns = await dbHandler.getWarns(target.id)

        if (warns == null || warns.length == 0)
        {
            return await message.reply(embedHelper.makeError(this.client, `${target} has no active warnings.`))
        }

        if (warns.length < num)
        {
            return await message.reply(embedHelper.makeError(this.client, "No warn found with that number. Have you checked !warns?"))
        }

        let warning = warns[num - 1]

        await dbHandler.removeWarn(warning.id)
        
        await message.reply(embedHelper.makeSuccess(this.client, `Removed warning #${num} (${warning.id}) from ${target} successfuly.`))
    }
}

module.exports = RemoveWarningCommand