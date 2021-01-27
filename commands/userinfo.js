/// <reference path="../typings/eft.d.ts">/>

const { Command, TypeResolver } = require('discord-akairo');
const ContentParser = require('discord-akairo/src/struct/commands/ContentParser');
const { User } = require('discord.js');
const { GuildMember } = require('discord.js');
const EFTMessage = require('../eftMessage');
const embedHelper = require("../embedHelper")
const { DateTime } = require("luxon")

class UserInfoCommand extends Command {
    constructor() {
        super('userInfo', {
           aliases: ["userinfo"],
           clientPermissions: ["SEND_MESSAGES"],
           args: [
               {
                   id: "target",
                   type: "member"
               }
           ],
           channel: "guild",
           typing: false,
        });
    }
    /**
     *
     *
     * @param {EFTMessage} message
     * @param {Object} obj
     * @param {GuildMember} obj.target
     * @returns
     * @memberof UserInfoCommand
     */
    async exec(message, { target }) {
        let server = message.client.getGuild()
        let dbHandler = message.client.databaseHandler

        let reputation = await dbHandler.getReputation(target.id) || 0
        let warnings = await dbHandler.getWarns(target.id) || []
        let creationDate = target.user.createdAt
        let joinDate = target.joinedAt

        let embed = embedHelper.makeSimpleEmbed(this.client, "", `${target.user.username}#${target.user.discriminator}`, 0xffa500)

        embed.addField("Creation Date", creationDate.toString(), true)
        embed.addField("Join Date", joinDate.toString(), true)
        embed.addField("ID", target.id)
        embed.addField("Reputation", reputation, true)   
        embed.addField("Warnings", warnings.length, true)

        embed.setThumbnail(target.user.avatarURL() || target.user.defaultAvatarURL)

        await message.reply(embed)
    }
}

module.exports = UserInfoCommand;