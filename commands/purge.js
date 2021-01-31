const fs = require("fs") 
const { Command } = require('discord-akairo');
const { Message } = require("discord.js");
const EFTMessage = require("../eftMessage");

class PurgeCommand extends Command {
    constructor() {
        super('purge', {
           aliases: ['purge'],
           description: "Purge a specified number of messages from the current channel. Administrators only.",
           cooldown: 5000,
           ratelimit: 3,
           args: [
               {
                   id: "numToPurge",
                   type: "number",
                   description: "Number of messages to purge"

               }
           ],
           clientPermissions: ["MANAGE_MESSAGES"],
           userPermissions: ["ADMINISTRATOR"],
           channel: "guild"
        });
    }

    /**
     *
     *
     * @param {EFTMessage} message
     * @returns
     * @memberof PurgeCommand
     */
    async exec(message, {numToPurge}) {
        if (numToPurge == null || numToPurge <= 0)
        {
            return await message.reply("Invalid number of messages to purge.")
        }

        // If purge num is over 100, stop.
        if (numToPurge > 100)
        {
            return await message.reply("You cannot purge any more than 100 messages at a time.")
        }

        if (numToPurge === 100) numToPurge-- // We do this to make sure numToPurge stays at 100 when it's incremented below, since apparently API only limits you to 100 messages

        // Add 1 to numToPurge to account for message that triggered this command
        // Automatically filter out messages that are too old to delete (Can only bulk delete messages under 14 days old)
        await message.channel.bulkDelete(numToPurge + 1, true)

        console.log(`${message.author.id} purged ${numToPurge} messages from the ${message.channel.name} channel.`)
    }
}

module.exports = PurgeCommand;