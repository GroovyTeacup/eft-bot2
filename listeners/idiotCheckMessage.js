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
        // This happens apparently. I think because of DMs? TODO: test
        if (message.member == null) return
        let muted = await message.client.muteHandler.isMemberMuted(message.member.id)

        // Don't try to delete messages from muted members; They'll already be deleted anyway.
        if (message.channel.id == configServer.IdiotCheck && !muted)
        {
            let member = message.member

            // Don't delete messages made by administrators
            if (member.hasPermission("ADMINISTRATOR")) return
            
            if (message.deletable && !message.deleted)
            {
                await message.delete().catch((err) => console.log(`Failed to delete idiot-check message for member ${message.user.id}. (${err})`))
            }
        }
        
    }
}

module.exports = IdiotCheckDeleteListener;
