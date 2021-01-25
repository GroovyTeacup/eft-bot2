const { Listener } = require('discord-akairo');
const { GuildMember } = require("discord.js")

class ReputationRolesListener extends Listener {
    constructor() {
        super('reputationRoles', {
            emitter: 'commandHandler',
            event: 'reputationChanged'
        });
    }

    /**
     *
     *
     * @param {GuildMember} member
     * @param {number} oldReputation
     * @param {number} newReputation
     * @memberof ReputationRolesListener
     */
    async exec(member, oldReputation, newReputation) {
        let configServer = this.client.configServer
        let repRoles = configServer.ReputationRoles

        //console.log(`Reputation of member ${member.id} has changed from ${oldReputation} to ${newReputation}`)
        
        for (const role of repRoles)
        {
            let hasRole = member.roles.cache.has(role.id)

            if (!hasRole && newReputation >= role.num)
            {
                await member.roles.add(role.id)
                console.log(`${member.id} has reached ${role.num} reputation and so the role ${role.id} has been given to them.`)
            }

            if (hasRole && newReputation < role.num)
            {
                await member.roles.remove(role.id)
                console.log(`${member.id} has gone below ${role.num} reputation and so the role ${role.id} has been removed from them.`)
            }
        }
    }
}

module.exports = ReputationRolesListener;
