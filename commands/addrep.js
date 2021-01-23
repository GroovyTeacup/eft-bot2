/// <reference path="../typings/eft.d.ts">/>

const { Command } = require('discord-akairo');
const { GuildMember } = require('discord.js');
const EFTMessage = require('../eftMessage');
const embedHelper = require("../embedHelper")

class AddReputationCommand extends Command {
    constructor() {
        super('addrep', {
           aliases: ['addrep', "repadd", "giverep"],
           args: [
               {
                   id: "target",
                   type: "member"
               }
           ],
           channel: "guild",
           typing: true
        });
    }
    
    /**
     *
     *
     * @param {EFTMessage} message
     * @param {object} obj
     * @param {GuildMember} obj.target
     * @returns
     * @memberof AddReputationCommand
     */
    async exec(message, { target }) {
        if (target == null)
        {
            return await message.reply("Usage: `!addrep <Member>`")
        }
        
        // Stop the big brain attempts of people giving themselves reputation
        /*if (message.member.id === target.id)
        {
            return await message.reply(embedHelper.makeError(this.client, "Rolling a d20 for ban..."))
        }*/

        // Meme
        if (target.user.id == this.client.user.id)
        {
            return await message.reply(embedHelper.makeError(this.client, "Jrypbzr gb ZpQbanyqf, znl V gnxr lbhe beqre?", "ZpQbanyqf Qevir-Gueh"))
        }

        // Stop people from adding reputation to bots
        if (target.user.bot)
        {
            return await message.reply(embedHelper.makeError(this.client, "Bots are not people."))
        }

        let dbHandler = message.client.databaseHandler
        let reputation = await dbHandler.getReputation(target.id)
        if (reputation == null)
        {
            // TODO
            return
        }

        await dbHandler.setReputation(target.id, reputation + 1)
        await message.reply(embedHelper.makeSuccess(this.client, `${target} now has ${reputation + 1} reputation.`, "Added Reputation"))
        message.client.commandHandler.emit("reputationAdded", message.member, target, reputation + 1)
        console.log(`${message.member.id} has given 1 reputation to member ${target.id}`)
    }
}

module.exports = AddReputationCommand;