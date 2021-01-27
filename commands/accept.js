/// <reference path="../typings/eft.d.ts">/>

const { Command } = require('discord-akairo');
const { GuildMember } = require('discord.js');
const EFTMessage = require('../eftMessage');
const embedHelper = require("../embedHelper")

class AcceptCommand extends Command {
    constructor() {
        super('accept', {
           aliases: ["accept"],
           channel: "guild"
        });
    }
    
    /**
     * Prevent this command from being run outside the idiot check channel
     *
     * @param {EFTMessage} message
     * @returns
     * @memberof AcceptCommand
     */
    async condition(message)
    {
        let id = this.client.configServer.IdiotCheck
        return message.channel.id == id
    }

    /**
     *
     *
     * @param {EFTMessage} message
     * @returns
     * @memberof AcceptCommand
     */
    async exec(message) {
        let member = message.member
        let memberRoleId = this.client.configServer.MemberRole

        // Don't register them if they already have the member role (use the register command for that)
        if (member.roles.cache.has(memberRoleId)) return

        await member.roles.add(memberRoleId).catch((reason) => console.error(`Failed to add member role to member ${member.id} (${reason})`))

        let dbHandler = message.client.databaseHandler

        let dbMember = await dbHandler.getMemberById(member.id)
        if (dbMember != null) return // don't register members already in the database

        await dbHandler.addMember(member)
        console.log(`Registered ${member.id} as a new member. (!accept)`)
    }
}

module.exports = AcceptCommand;