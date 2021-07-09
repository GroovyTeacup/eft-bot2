/// <reference path="../typings/eft.d.ts">/>

const { Command } = require('discord-akairo');
const { GuildMember } = require('discord.js');
const EFTMessage = require('../eftMessage');
const embedHelper = require("../embedHelper")

class RegisterCommand extends Command {
    constructor() {
        super('register', {
           aliases: ["register"],
           args: [
               {
                   id: "target",
                   type: "member"
               }
           ],
           channel: "guild"
        });
    }

    /**
     *
     *
     * @param {EFTMessage} message
     * @returns
     * @memberof RegisterCommand
     */
    async exec(message, { target }) {
        let member = message.member
        let memberRoleId = this.client.configServer.MemberRole

        if (!message.client.isStaffMember(member)) return

        if (target == null)
        {
            return await message.reply("Usage: `!register <Member>`")
        }

        let dbHandler = message.client.databaseHandler

        if (await dbHandler.memberExists(target.id))
        {
            return await message.reply(embedHelper.makeError(this.client, `${target} is already registered as a member!`))
        }

        await target.roles.add(memberRoleId).catch((reason) => console.error(`Failed to add member role to member ${target.id} (${reason})`))

        await dbHandler.addMember(target)

        await message.reply(embedHelper.makeSuccess(this.client, `Registered ${target} as a member`))
        console.log(`Registered ${target.id} as a new member. (!register)`)
    }
}

module.exports = RegisterCommand;