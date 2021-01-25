/// <reference path="../typings/eft.d.ts">/>

const { Command } = require('discord-akairo');
const { GuildMember } = require('discord.js');
const EFTMessage = require('../eftMessage');
const embedHelper = require("../embedHelper")

class RemoveReputationCommand extends Command {
    constructor() {
        super('setrep', {
           aliases: ['setrep'],
           description: "Set the reputation of a given member to a specified number. Staff only.",
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
     * @param {number} obj.amount
     * @returns
     * @memberof RemoveReputationCommand
     */
    async exec(message, { target, amount }) {
        if (!message.client.isStaffMember(message.member)) return
        
        if (target == null || amount == null)
        {
            return await message.reply("Usage: `!setrep <Member> <Amount>`")
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

        let dbHandler = message.client.databaseHandler
        let reputation = await dbHandler.getReputation(target.id)
        if (reputation == null)
        {
            return await message.reply(embedHelper.makeError(this.client, `${target} is not a registered member. You cannot change their reputation.`))
        }

        if (amount >= 2147483647)
        {
            return await message.reply(embedHelper.makeError(this.client, `Reputation number too high.`))
        }

        await dbHandler.setReputation(target.id, amount)
        await message.reply(embedHelper.makeSuccess(this.client, `${target} now has ${amount} reputation.`, "Set Reputation"))
        message.client.commandHandler.emit("reputationChanged", message.member, reputation, amount)
        console.log(`(ADMIN) ${message.member.id} has set the reputation of ${target.id} to ${amount}`)
    }
}

module.exports = RemoveReputationCommand;