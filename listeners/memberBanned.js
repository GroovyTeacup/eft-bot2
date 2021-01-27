const { Listener } = require('discord-akairo');
const { User } = require('discord.js');
const DatabaseHandler = require('../databaseHandler');

class MemberBannedListener extends Listener {
    constructor() {
        super('memberBanned', {
            emitter: 'commandHandler',
            event: 'memberBanned'
        });
    }

    /**
     * @param {User} user
     * @param {GuildMember} issuer
     * @param {number} pruneDuration
     * @param {string} reason
     * @param {boolean} scammer
     *
     * @memberof MemberBannedListener
     */
    async exec(user, issuer, pruneDuration, reason, scammer) {
        /** @type {DatabaseHandler} */
        let dbHandler = this.client.databaseHandler
        console.log(`Adding ban of ${user.id} to database`)
        await dbHandler.addBan(user.id, issuer.id, reason, scammer)

        let dbMember = dbHandler.getMemberById(user.id)
        if (dbMember == null) return

        await dbHandler.updateMember(user.id, {
            is_banned: true,
            is_active: false
        })
    }
}

module.exports = MemberBannedListener;
