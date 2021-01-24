const { Inhibitor } = require('discord-akairo');
const EFTMessage = require('../eftMessage');

class RestrictChannels extends Inhibitor {
    constructor() {
        super('blockIdiotCheck', {
            reason: 'blockIdiotCheck'
        })
    }

    /**
     *
     *
     * @param {EFTMessage} message
     * @returns
     * @memberof RestrictChannels
     */
    exec(message) {
        if (message.member.hasPermission("ADMINISTRATOR")) return

        let configServer = this.client.configServer
        let prefix = this.client.config.CommandPrefix
        let validChannels = []
        validChannels.push(configServer.IdiotCheck)
        validChannels.push(configServer.CommandSpam)
        validChannels.push(configServer.CommandSpamStaff)

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
