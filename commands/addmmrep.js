/// <reference path="../typings/eft.d.ts">/>

const { Command } = require('discord-akairo');
const { GuildMember } = require('discord.js');
const EFTMessage = require('../eftMessage');
const embedHelper = require("../embedHelper")
const { DateTime } = require("luxon")

// this class sure looks familiar
class AddMMReputationCommand extends Command {
    constructor() {
        super('addmmrep', {
           aliases: ['addmmrep', "mmrepadd", "givemmrep"],
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
     * @memberof AddMMReputationCommand
     */
    async exec(message, { target }) {
        if (target == null)
        {
            return await message.reply("Usage: `!addmmrep <Member>`")
        }

        let author = message.author
        let middleManRoleId = this.client.configServer.MiddlemanRole
        
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

        if (!target.roles.cache.has(middleManRoleId))
        {
            return await message.reply(embedHelper.makeError(this.client, "That member is not a middleman and cannot receive middleman reputation."))
        }

        let reps = this.repAddCache[author.id]

        if (reps != null && reps[target.id] != null)
        {
            let time = reps[target.id]
            let delayMinutes = this.client.configServer.ReputationDelay || 15

            if (DateTime.local() < time.plus({minutes: delayMinutes}))
            {
                return await message.reply(embedHelper.makeError(this.client, `You cannot give middleman reputaton to ${target} again so soon.`))
            }
        }
        else
        {
            this.repAddCache[author.id] = reps || {}
        }

        let dbHandler = message.client.databaseHandler
        let reputation = await dbHandler.getMMReputation(target.id)
        if (reputation == null)
        {
            if (target.roles.cache.has(this.client.configServer.MemberRole))
            {
                console.warn(`Middleman ${target.id} is receiving reputation, has the member role, but isn't a registered member in the database (Huh????). Trying to register them now...`)

                reputation = 0
                await dbHandler.addMember(target)
            }
            else
            {
                return await message.reply(embedHelper.makeError(this.client, `${target} is not a registered member. You cannot give them middleman reputation.`))
            }
        }

        if (reputation >= 2147483647)
        {
            return await message.reply(embedHelper.makeError(this.client, `Reputation number too high.`))
        }

        this.repAddCache[author.id][target.id] = DateTime.local()

        await dbHandler.setMMReputation(target.id, reputation + 1)
        await message.reply(embedHelper.makeSuccess(this.client, `${target} now has ${reputation + 1} middleman reputation.`, "Added MM Reputation"))
        message.client.commandHandler.emit("mmReputationChanged", target, reputation, reputation + 1)
        console.log(`${message.member.id} has given 1 middleman reputation to member ${target.id}`)
    }
}

module.exports = AddMMReputationCommand;