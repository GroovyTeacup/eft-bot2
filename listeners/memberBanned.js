const { Listener } = require('discord-akairo');
const { User } = require('discord.js');

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
        let dbHandler = this.client.databaseHandler
        console.log(`Adding ban of ${user.id} to database`)
        return await dbHandler.addBan(user.id, issuer.id, reason, scammer)
    }
}

module.exports = MemberBannedListener;
