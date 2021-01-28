const EFTClient = require("./eftClient")
const { MessageEmbed, Message } = require("discord.js")
const { TextChannel } = require("discord.js")
const { GuildMember, GuildMemberRoleManager } = require("discord.js")
const { DateTime } = require("luxon")

/**
 *
 * @class MuteHandler
 */
class MuteHandler {
    /**
     * Creates an instance of MuteHandler.
     * @param {EFTClient} client
     * @memberof MuteHandler
     */
    constructor(client) {
        this.client = client
        this.dbHandler = client.databaseHandler
        this.roleId = client.configServer.MutedRole
        this.mutedMembers = {}
        
        client.addListener("ready", async () => {
            let mutes = await this.dbHandler.getMutes()
            
            for (const mute of mutes)
            {
                this.mutedMembers[mute.member_id] = {
                    memberId: mute.member_id,
                    issuerId: mute.issuer_id,
                    duration: mute.duration,
                    endDate: mute.end_date
                }
            }

            console.log(`Loaded ${mutes.length} existing mutes in the database.`)

            this.muteUpdateTimer = setInterval(() => {
                for (const mute of Object.values(this.mutedMembers))
                {
                    let endDate = DateTime.fromJSDate(mute.endDate)
                    if (DateTime.local() >= endDate)
                    {
                        this.unmuteMember(mute.memberId)
                        console.log(`${mute.memberId} has been automatically unmuted.`)
                    }
                }
            }, 1000 * 60)
        })

        client.addListener("message", async (message) => {
            let member = message.member
            // This happens apparently. I think because of DMs? TODO: test
            if (member == null) return
            let isMuted = this.isMemberMuted(member.id)

            if (isMuted && message.deletable && !message.deleted)
            {
                await message.delete()
                console.log(`Deleted message from muted member ${member.id}`)
            }
        })
    }

    /**
     * Check if a member is muted
     *
     * @param {string} memberId The id of the member to check
     * @returns {boolean}
     * @memberof MuteHandler
     */
    isMemberMuted(memberId)
    {
        return this.mutedMembers[memberId] !== undefined
    }

    /**
     * Mute a member with a duration in minutes
     *
     * @param {string} memberId The id of the member being muted
     * @param {number} duration The duration of the mute in minutes
     * @param {GuildMember} issuerId The id of the member issuing the mute
     * @memberof MuteHandler
     */
    async muteMember(memberId, duration, issuerId)
    {
        let endDate = DateTime.local().plus({minutes: duration}).toJSDate()

        await this.dbHandler.addMute(memberId, issuerId, endDate)
        this.mutedMembers[memberId] = {
            memberId: memberId,
            issuerId: issuerId,
            duration: duration,
            endDate: endDate
        }

        let member = await this.client.getGuild().members.fetch({
            user: memberId
        }).catch((err) => console.error("Failed to fetch member to add muted role."))

        if (member == null || member.roles.cache.has(this.roleId)) return

        await member.roles.add(this.roleId)
    }

    /**
     * Unmute a member
     *
     * @param {GuildMember} memberId The member to unmute
     * @memberof MuteHandler
     */
    async unmuteMember(memberId)
    {
        await this.dbHandler.removeMute(memberId)
        delete this.mutedMembers[memberId]

        let member = await this.client.getGuild().members.fetch({
            user: memberId
        }).catch((err) => console.error("Failed to fetch member to remove muted role."))

        if (member == null || !member.roles.cache.has(this.roleId)) return

        await member.roles.remove(this.roleId)
    }
}

module.exports = MuteHandler