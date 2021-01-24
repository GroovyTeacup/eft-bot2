/// <reference path="../typings/eft.d.ts">/>

const { Command } = require('discord-akairo');
const { GuildMember } = require('discord.js');
const EFTMessage = require('../eftMessage');
const embedHelper = require("../embedHelper")

class RegisterMeCommand extends Command {
    constructor() {
        super('registerme', {
           aliases: ["registerme"],
           channel: "guild"
        });
    }

    /**
     *
     *
     * @param {EFTMessage} message
     * @returns
     * @memberof RegisterMeCommand
     */
    async exec(message) {
        let member = message.member
        let memberRoleId = this.client.configServer.MemberRole
        
        let dbHandler = message.client.databaseHandler

        if (dbHandler.memberExists(member.id))
        {
            return await message.reply(embedHelper.makeError(this.client, "You're already registered as a member!"))
        }

        await member.roles.add(memberRoleId).catch((reason) => console.error(`Failed to add member role to member ${member.id} (${reason})`))
        await dbHandler.addMember(member)

        await message.reply(embedHelper.makeSuccess(this.client, `Registered ${member} as a member`))
        console.log(`Registered ${member.id} as a new member. (!registerme)`)
    }
}

module.exports = RegisterMeCommand;