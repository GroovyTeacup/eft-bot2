/// <reference path="../typings/eft.d.ts">/>

const { Command } = require('discord-akairo');
const { GuildMember } = require('discord.js');
const EFTMessage = require('../eftMessage');
const embedHelper = require("../embedHelper")

class SetMMReputationCommand extends Command {
    constructor() {
        super('setmmrep', {
           aliases: ['setmmrep'],
           args: [
               {
                   id: "target",
                   type: "member"
               },
               {
                   id: "amount",
                   type: "number"
               }
           ],
           channel: "guild",
           typing: false
        });
    }
    
    /**
     *
     *
     * @param {EFTMessage} message
     * @param {object} obj
     * @param {GuildMember} obj.target
     * @returns
     * @memberof SetMMReputationCommand
     */
    async exec(message, { target, amount }) {
        if (!message.client.isStaffMember(message.member)) return

        let middleManRoleId = this.client.configServer.MiddlemanRole
        
        if (target == null)
        {
            return await message.reply("Usage: `!setmmrep <Member>`")
        }

        // Meme
        if (target.user.id == this.client.user.id)
        {
            return await message.reply(embedHelper.makeError(this.client, "Jrypbzr gb ZpQbanyqf, znl V gnxr lbhe beqre?", "ZpQbanyqf Qevir-Gueh"))
        }

        if (target.user.bot)
        {
            return await message.reply(embedHelper.makeError(this.client, "That's a bot dude."))
        }

        if (!target.roles.cache.has(middleManRoleId))
        {
            return await message.reply(embedHelper.makeError(this.client, "That member is not a middleman and does not have middleman reputation."))
        }

        let dbHandler = message.client.databaseHandler
        let reputation = await dbHandler.getMMReputation(target.id)
        if (reputation == null)
        {
            return await message.reply(embedHelper.makeError(this.client, `${target} is not a registered member. You cannot change their middleman reputation.`))
        }

        if (amount >= 2147483647)
        {
            return await message.reply(embedHelper.makeError(this.client, `Reputation number too high.`))
        }

        await dbHandler.setMMReputation(target.id, amount)
        await message.reply(embedHelper.makeSuccess(this.client, `${target} now has ${amount} middleman reputation.`, "Set MM Reputation"))
        message.client.commandHandler.emit("mmReputationChanged", target, reputation, amount)
        console.log(`(ADMIN) ${message.member.id} has set the middleman reputation of ${target.id} to ${amount}`)
    }
}

module.exports = SetMMReputationCommand;