const { Inhibitor } = require('discord-akairo');
const EFTMessage = require('../eftMessage');
const ContentParser = require('discord-akairo/src/struct/commands/ContentParser');

class MutedMembersInhibitor extends Inhibitor {
    constructor() {
        super('mutedMembers', {
            reason: 'mutedMembers'
        })
    }

    /**
     * Block all command usage of muted members.
     *
     * @param {EFTMessage} message
     * @returns
     * @memberof MutedMembersInhibitor
     */
    exec(message) {
        let muteHandler = message.client.muteHandler
        
        if (muteHandler.isMemberMuted(message.member.id))
        {
            return true
        }
    }
}

module.exports = MutedMembersInhibitor;
