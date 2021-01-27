 
const { Listener, Command } = require('discord-akairo');
const DatabaseHandler = require('../databaseHandler.js');
const EFTMessage = require('../eftMessage.js');

class MemberRemovedListener extends Listener {
    constructor() {
        super('memberRemoved', {
            emitter: 'client',
            event: 'guildMemberRemove'
        });
    }

    /**
     *
     *
     * @param {GuildMember} member
     * @memberof MemberRemovedListener
     */
    async exec(member) {
        /** @type {DatabaseHandler} */
        let dbHandler = this.client.databaseHandler

        let dbMember = await dbHandler.getMemberById(member.id)
        if (dbMember == null) return

        console.log(`Registered member ${member.id} has left the server. Marking as inactive.`)

        await dbHandler.updateMember(member.id, {
            is_active: false
        }).catch(err => console.error("Failed to mark member as inactive: ", err))
    }
}

module.exports = MemberRemovedListener;
