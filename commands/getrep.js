/// <reference path="../typings/eft.d.ts">/>

const { Command } = require('discord-akairo');
const { GuildMember } = require('discord.js');
const EFTMessage = require('../eftMessage');
const embedHelper = require("../embedHelper")

class ShowReputationCommand extends Command {
    constructor() {
        super('showrep', {
           aliases: ['getrep', "rep", "showrep"],
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
     * @memberof ShowReputationCommand
     */
    async exec(message, { target }) {
        if (target == null)
        {
            return await message.reply("Usage: `!showrep <Member>`")
        }

        // Meme
        if (target.user.id == this.client.user.id)
        {
            return await message.reply(embedHelper.makeError(this.client, "Jrypbzr gb ZpQbanyqf, znl V gnxr lbhe beqre?", "ZpQbanyqf Qevir-Gueh"))
        }

        if (target.user.bot)
        {
            return await message.reply(embedHelper.makeError(this.client, "Bots are not people."))
        }

        let dbHandler = message.client.databaseHandler
        let reputation = await dbHandler.getReputation(target.id)
        if (reputation == null)
        {
            return await message.reply(embedHelper.makeError(this.client, `${target} is not a registered member. They have no reputation.`))
        }

        await message.reply(embedHelper.makeSuccess(this.client, `${target} currently has ${reputation} reputation.`, "Total Reputation"))
        console.log(`${message.member.id} requested the reputation for member ${target.id}`)
    }
}

module.exports = ShowReputationCommand;