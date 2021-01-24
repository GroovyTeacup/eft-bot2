const { Listener } = require('discord-akairo');
const { GuildMember, User } = require('discord.js');
const configServer = require("../configServer.json")

class MemberBannedScammerListener extends Listener {
    constructor() {
        super('memberBannedScammer', {
            emitter: 'commandHandler',
            event: 'memberBannedScammer'
        });
    }

    /**
     * @param {User} user
     * @param {GuildMember} issuer
     * @param {string} gameName
     * @param {number} pruneDuration
     * @param {string} reason
     *
     * @memberof MemberBannedScammerListener
     */
    async exec(user, issuer, gameName, pruneDuration, reason) {
        return await this.client.logNewScammer(user, gameName, reason)
    }
}

module.exports = MemberBannedScammerListener;
