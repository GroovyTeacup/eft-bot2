/// <reference path="../typings/eft.d.ts">/>

const { Command } = require('discord-akairo');
const { GuildMember } = require('discord.js');
const EFTMessage = require('../eftMessage');
const embedHelper = require("../embedHelper")

class RemoveReputationCommand extends Command {
    constructor() {
        super('rmrep', {
           aliases: ['rmrep', "removerep", "repremove", "takerep"],
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
     * @memberof RemoveReputationCommand
     */
    async exec(message, { target }) {
        if (target == null)
        {
            return await message.reply("Usage: `!rmrep <Member>`")
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
            // TODO
            return
        }

        await dbHandler.setReputation(target.id, reputation - 1)
        await message.reply(embedHelper.makeSuccess(this.client, `${target} now has ${reputation - 1} reputation.`, "Removed Reputation"))
        message.client.commandHandler.emit("reputationSet", message.member, target, reputation - 1)
        console.log(`(ADMIN) ${message.member.id} has taken 1 reputation from member ${target.id}`)
    }
}

module.exports = RemoveReputationCommand;