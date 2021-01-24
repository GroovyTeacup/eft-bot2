const { AkairoClient, CommandHandler, ListenerHandler, InhibitorHandler } = require('discord-akairo');
const { Intents } = require('discord.js');
const { Message } = require('discord.js');
const DatabaseHandler = require("./databaseHandler")
const path = require("path")
const fs = require("fs");
const { User } = require('discord.js');
const embedHelper = require("./embedHelper");
const { GuildMember } = require('discord.js');

const VERSION = "2.0.0"

/**
 *
 *
 * @class EFTClient
 * @extends {AkairoClient}
 */
class EFTClient extends AkairoClient {
    constructor(ownerID) {
        super({
            ownerID: ownerID || -1,
            // Options for Akairo go here.
        }, {
            //disableMentions: "all",
            messageCacheLifetime: 86400, // every day
            messageSweepInterval: 3600, // every hour
            partials: ["REACTION", "MESSAGE"],
            ws: {
                intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MESSAGE_REACTIONS", "GUILD_MEMBERS", "GUILD_BANS", "GUILD_MESSAGE_TYPING"]
            },
            restRequestTimeout: 15000,
            // Options for discord.js go here.
        });

        console.log(`Initializing EFTClient ${VERSION}`)
        
        this.botVersion = VERSION
        this.config = JSON.parse(fs.readFileSync("config.json").toString())
        this.configServer = JSON.parse(fs.readFileSync("configServer.json").toString())

        // Create Command Handler instance.
        this.commandHandler = new CommandHandler(this, {
            directory: path.join(__dirname, "commands"), // Directory the commands are loaded from
            prefix: this.config.CommandPrefix, // The command prefix
            blockClient: true,
            blockBots: true,
            allowMention: false,
            commandUtil: true,
            fetchMembers: true // Fetch message authors for commands instead of grabbing from cache
        })

        this.inhibitorHandler = new InhibitorHandler(this, {
            directory: path.join(__dirname, "inhibitors")
        });

        this.commandHandler.useInhibitorHandler(this.inhibitorHandler)

        this.listenerHandler = new ListenerHandler(this, {
            directory: path.join(__dirname, "listeners"),
        })

        this.listenerHandler.setEmitters({
            commandHandler: this.commandHandler,
            listenerHandler: this.listenerHandler,
        });

        this.databaseHandler = new DatabaseHandler(this)

        console.log("Loading command files")
        this.commandHandler.loadAll() // Load all commands

        console.log("Loading inhibitor files")
        this.inhibitorHandler.loadAll()

        console.log("Loading listener files")
        this.listenerHandler.loadAll()

        console.log("Opening bot database")
        this.databaseHandler.loadData()
    }

    // Since this bot is only really meant to be run for a single guild we can do this
    getGuild()
    {
        return this.util.resolveGuild(this.config.ServerID, this.guilds.cache)
    }

    async logBotAction(content, title)
    {
        let server = this.getGuild()
        let channel = server.channels.resolve(this.configServer.BotLogs, server.channels.cache)

        if (channel == null) return console.error(`Tried to log bot action but bot logs channel doesn't exist (${this.configServer.BotLogs})`)
        if (!channel.isText()) return console.error(`Tried to log bot action but bot logs channel is not a text channel (${this.configServer.BotLogs})`)

        await channel.send(content, title ? title : null)
    }

    /**
     * 
     * @param {User} user
     * @param {string} gameName
     * @param {string} reason
     * @memberof EFTClient
     */
    async logNewScammer(user, gameName, reason)
    {
        let server = this.getGuild()
        let scammerNotifyRole = server.roles.resolve(this.configServer.ScammerUpdatesRole, server.roles.cache)
        let scammerNotifyChannel = server.channels.resolve(this.configServer.ScammerNotify, server.channels.cache)
        let scammerListChannel = server.channels.resolve(this.configServer.KnownScammers, server.channels.cache)

        if (scammerListChannel == null)
        {
            console.error("Tried to add new scammer messages but the scammer list channel doesn't exist.", scammerListChannel)
            return false
        }

        if (scammerNotifyChannel == null)
        {
            console.error("Tried to add new scammer messages but the scammer notifications channel doesn't exist.", scammerNotifyChannel)
            return false
        }

        if (scammerNotifyRole == null)
        {
            console.error("Tried to add new scammer messages but the scammer notifications role doesn't exist.", scammerNotifyRole)
            return false
        }

        let banReason = reason == "No reason specified." ? "" : `\nBan Reason: \`${reason}\``

        scammerListChannel.send(`Discord Username: \`${user.username}#${user.discriminator}\` | Discord ID: \`${user.id}\` | IGN: \`${gameName}\` ${banReason}`)
        scammerNotifyChannel.send(`${scammerNotifyRole} The discord member ${user.username}#${user.discriminator} (IGN: ${gameName}) has been added to ${scammerListChannel}`)
    }

    /**
     *
     *
     * @param {GuildMember} member
     * @returns
     * @memberof EFTClient
     */
    async isStaffMember(member)
    {
        if (member == null) return false

        if (member.hasPermission("ADMINISTRATOR"))
        {
            return true
        }

        let staffRoles = this.configServer.StaffRoles
        if (staffRoles != null)
        {
            for (let i = 0; i < staffRoles.length; i++)
            {
                let id = staffRoles[i]
                if (member.roles.cache.has(id))
                {
                    return true
                }
            }
        }

        // Administrators are always "staff". Otherwise, return false if StaffRoles is not defined yet or the user doesn't have a staff role.
        return false
    }
}

module.exports = EFTClient