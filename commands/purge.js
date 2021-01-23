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
           clientPermissions: ["ADMINISTRATOR"],
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

        // Add 1 to numToPurge to account for message that triggered this command
        await message.channel.bulkDelete(numToPurge + 1)

        console.log(`${message.author.id} purged ${numToPurge} messages from the ${message.channel.name} channel.`)
    }
}

module.exports = PurgeCommand;