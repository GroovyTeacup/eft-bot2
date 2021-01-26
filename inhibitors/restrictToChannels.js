const { Inhibitor } = require('discord-akairo');
const EFTMessage = require('../eftMessage');
const ContentParser = require('discord-akairo/src/struct/commands/ContentParser');

class RestrictChannels extends Inhibitor {
    constructor() {
        super('blockIdiotCheck', {
            reason: 'blockIdiotCheck'
        })

        this.commandWhitelist = [
            "mute",
            "unmute"
        ]
    }

    /**
     *
     *
     * @param {EFTMessage} message
     * @returns
     * @memberof RestrictChannels
     */
    exec(message) {
        if (message.member.hasPermission("ADMINISTRATOR")) return // Administrators can run commands wherever they want

        let configServer = this.client.configServer
        let prefix = this.client.config.CommandPrefix
        let validChannels = []
        validChannels.push(configServer.IdiotCheck)
        validChannels.push(configServer.CommandSpam)
        validChannels.push(configServer.CommandSpamStaff)

        // Allow non-administrator staff members to use certain whitelisted commands outside of the command spam channels
        if (message.content.startsWith(prefix) && message.client.isStaffMember(message.member))
        {
            let parser = new ContentParser()

            let arr = parser.parse(message.content).all
            let command = arr[0].value
            command = command.substr(1, command.length)
            if (this.commandWhitelist.includes(command))
            {
                return false;
            }
        }

        if (validChannels.includes(message.channel.id))
        {
            // If any command in the idiot check channel is not the accept command, ignore it.
            if (message.channel.id == this.client.configServer.IdiotCheck && !message.content.toLowerCase().startsWith(prefix + "accept"))
            {
                return true
            }

            return false
        }
        else
        {
            // Block commands in every other channel
            return true
        }
    }
}

module.exports = RestrictChannels;
