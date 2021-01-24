/// <reference path="../typings/eft.d.ts">/>

const { Command } = require('discord-akairo');
const { MessageEmbed } = require('discord.js');
const { GuildMember, User } = require('discord.js');
const EFTMessage = require('../eftMessage');
const embedHelper = require("../embedHelper")

class ReputationTopCommand extends Command {
    constructor() {
        super('reptop', {
           aliases: ['reptop', 'repleaderboard'],
           channel: "guild",
           typing: true
        });
    }
    
    /**
     *
     *
     * @param {EFTMessage} message
     * @returns
     * @memberof ReputationTopCommand
     */
    async exec(message) {
        let dbHandler = message.client.databaseHandler
        let top = await dbHandler.getReputationTop(10)

        let embed = embedHelper.makeSuccess(this.client, "", "Reputation Leaderboard")
        let txt = ""
        let count = 1
        for (const usr of top)
        {
            let member = await message.guild.members.fetch({
                user: usr.member_id
            }).catch((err) => console.error(`Failed to get discord member ${usr.member_id} for reptop.`))

            let name = member == null ? `${usr.member_name} (**NotInServer**)` : `<@${usr.member_id}>`

            txt += `\n**${count}**. ${name}\n${usr.reputation}\n`
            count++
        }

        embed.setDescription(txt)
        await message.reply(embed)
    }
}

module.exports = ReputationTopCommand;