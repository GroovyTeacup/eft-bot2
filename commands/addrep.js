/// <reference path="../typings/eft.d.ts">/>

const { Command } = require('discord-akairo');
const { GuildMember } = require('discord.js');
const EFTMessage = require('../eftMessage');
const embedHelper = require("../embedHelper")
const { DateTime } = require("luxon")

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

        this.repAddCache = {}
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

        let author = message.author
        
        // Stop the big brain attempts of people giving themselves reputation
        if (message.member.id === target.id)
        {
            return await message.reply(embedHelper.makeError(this.client, "Rolling a d20 for ban..."))
        }

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

        let reps = this.repAddCache[author.id]

        if (reps != null && reps[target.id] != null)
        {
            let time = reps[target.id]
            let delayMinutes = this.client.configServer.ReputationDelay || 15

            if (DateTime.local() < time.plus({minutes: delayMinutes}))
            {
                return await message.reply(embedHelper.makeError(this.client, `You cannot give reputaton to ${target} again so soon.`))
            }
        }
        else
        {
            this.repAddCache[author.id] = reps || {}
        }

        let dbHandler = message.client.databaseHandler
        let reputation = await dbHandler.getReputation(target.id)
        if (reputation == null)
        {
            if (target.roles.cache.has(this.client.configServer.MemberRole))
            {
                console.warn(`User ${target.id} is receiving reputation, has the member role, but isn't a registered member in the database. Trying to register them now...`)

                reputation = 0
                await dbHandler.addMember(target)
            }
            else
            {
                return await message.reply(embedHelper.makeError(this.client, `${target} is not a registered member. You cannot give them reputation.`))
            }
        }

        if (reputation >= 2147483647)
        {
            return await message.reply(embedHelper.makeError(this.client, `Reputation number too high.`))
        }

        this.repAddCache[author.id][target.id] = DateTime.local()

        await dbHandler.setReputation(target.id, reputation + 1)
        await message.reply(embedHelper.makeSuccess(this.client, `${target} now has ${reputation + 1} reputation.`, "Added Reputation"))
        message.client.commandHandler.emit("reputationChanged", target, reputation, reputation + 1)
        console.log(`${message.member.id} has given 1 reputation to member ${target.id}`)
    }
}

module.exports = AddReputationCommand;