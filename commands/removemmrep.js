/// <reference path="../typings/eft.d.ts">/>

const { Command } = require('discord-akairo');
const { GuildMember } = require('discord.js');
const EFTMessage = require('../eftMessage');
const embedHelper = require("../embedHelper")

class RemoveMMReputationCommand extends Command {
    constructor() {
        super('rmmmrep', {
           aliases: ['rmmmrep', "mmremoverep", "removemmrep", "mmrepremove", "takemmrep"],
           args: [
               {
                   id: "target",
                   type: "member"
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
     * @memberof RemoveMMReputationCommand
     */
    async exec(message, { target }) {
        if (message.member.hasPermission("ADMINISTRATOR")) return

        let middleManRoleId = this.client.configServer.MiddlemanRole
        
        if (target == null)
        {
            return await message.reply("Usage: `!removemmrep <Member>`")
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

        if (reputation >= 2147483647)
        {
            return await message.reply(embedHelper.makeError(this.client, `Reputation number too high.`))
        }

        await dbHandler.setMMReputation(target.id, reputation - 1)
        await message.reply(embedHelper.makeSuccess(this.client, `${target} now has ${reputation - 1} middleman reputation.`, "Removed MM Reputation"))
        message.client.commandHandler.emit("mmReputationChanged", target, reputation, reputation - 1)
        console.log(`(ADMIN) ${message.member.id} has taken 1 middleman reputation from member ${target.id}`)
    }
}

module.exports = RemoveMMReputationCommand;