 
const { Listener, Command } = require('discord-akairo');
const DatabaseHandler = require('../databaseHandler.js');
const EFTMessage = require('../eftMessage.js');

class MemberAddedListener extends Listener {
    constructor() {
        super('memberAdded', {
            emitter: 'client',
            event: 'guildMemberAdd'
        });
    }

    /**
     *
     *
     * @param {GuildMember} member
     * @memberof CommandErrorListener
     */
    async exec(member) {
        /** @type {DatabaseHandler} */
        let dbHandler = this.client.databaseHandler

        let dbMember = await dbHandler.getMemberById(member.id)
        if (dbMember == null) return

        console.log(`Registered member ${member.id} has joined the server. Marking as active.`)

        await dbHandler.updateMember(member.id, {
            member_name: `${member.user.username}#${member.user.discriminator}`,
            is_active: true,
            is_banned: false
        }).catch(err => console.error("Failed to mark member as active: ", err))
    }
}

module.exports = MemberAddedListener;
