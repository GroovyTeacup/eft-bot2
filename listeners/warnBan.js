const { Listener } = require('discord-akairo');
const { GuildMember } = require('discord.js');
const embedHelper = require("../embedHelper")

class WarnBanListener extends Listener {
    constructor() {
        super('warnBan', {
            emitter: 'commandHandler',
            event: 'memberWarned'
        });
    }

    /**
     * Ban a member if they reach x amount of warnings
     *
     * @param {GuildMember} member
     * @param {GuildMember} issuer
     * @param {string} reason
     * @memberof WarnBanListener
     */
    async exec(member, issuer, reason) {
        // At what amount of warns a member will get banned
        let threshold = this.client.config.WarnThreshold
        let dbHandler = this.client.databaseHandler
        
        // Get all of the member's (active) warnings.
        let warns = await dbHandler.getWarns(member.id)

        if (warns.length >= threshold)
        {
            if (!member.bannable) return console.error(`Not enough permissions to ban member ${member} for reaching max warning threshold.`)

            let bannedMember = await member.ban({
                reason: `Banned for reaching max warning threshold (${threshold}).\nLast warn issuer: ${issuer.user.username}#${issuer.user.discriminator} (${issuer.id})`
            }).catch((err) => console.error(`Failed to ban member ${member} for reaching max warning threshold. (${err})`))

            if (bannedMember == null) return // If the ban fails no point in continuing

            await dbHandler.clearWarns(member.id) // Make all existing warns inactive
            await this.client.logBotAction(embedHelper.makeSimpleEmbed(this.client, `${member} has been banned for reaching the max warning threshold (${threshold}).`, "Banned member " + member.user.username, 0x800080))
            console.log(`${member.id} has been banned for meeting the max warning threshold (${threshold}).`)
            this.handler.emit("memberBanned", member.user, this.client.getGuild().member, 0, `Reached the max warning threshold (${threshold})`, false)
        }
    }
}

module.exports = WarnBanListener;
