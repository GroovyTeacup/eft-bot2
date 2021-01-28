/// <reference path="../typings/eft.d.ts">/>

const { Command } = require('discord-akairo');
const EFTMessage = require('../eftMessage');

class VersionCommand extends Command {
    constructor() {
        super('version', {
           aliases: ["version"],
           clientPermissions: ["SEND_MESSAGES"],
           channel: "guild",
           typing: false,
        });
    }

    /**
     *
     *
     * @param {EFTMessage} message
     * @returns
     * @memberof VersionCommand
     */
    async exec(message) {
        if (!message.member.hasPermission("ADMINISTRATOR") && message.member.id != 178145436559867904) return

        await message.reply(`EFTBot is currently on version ${message.client.botVersion}`)
    }
}

module.exports = VersionCommand;