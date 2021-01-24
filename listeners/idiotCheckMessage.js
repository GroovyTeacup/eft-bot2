 const { Listener } = require('discord-akairo');
const EFTMessage = require('../eftMessage');
const ContentParser = require('discord-akairo/src/struct/commands/ContentParser');

class IdiotCheckDeleteListener extends Listener {
    constructor() {
        super('idiotCheckDelete', {
            emitter: 'client',
            event: 'message'
        });
    }

    /**
     *
     *
     * @param {EFTMessage} message
     * @returns
     * @memberof IdiotCheckDeleteListener
     */
    async exec(message) {
        let configServer = this.client.configServer

        if (message.channel.id == configServer.IdiotCheck)
        {
            let member = message.member

            // Don't delete messages made by administrators
            if (member.hasPermission("ADMINISTRATOR")) return
            
            if (message.deletable)
            {
                await message.delete()
            }

            return
        }
 
        
    }
}

module.exports = IdiotCheckDeleteListener;
