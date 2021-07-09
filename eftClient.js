const { AkairoClient, CommandHandler, ListenerHandler, InhibitorHandler } = require('discord-akairo');
const { Intents } = require('discord.js');
const { Message } = require('discord.js');
const DatabaseHandler = require("./databaseHandler")
const path = require("path")
const fs = require("fs");
const { User } = require('discord.js');
const embedHelper = require("./embedHelper");
const { GuildMember } = require('discord.js');
const MuteHandler = require('./muteHandler');
const MiddlemanBoardHandler = require('./mmBoardHandler');
const WarnHandler = require('./warnHandler');

const VERSION = "2.1.1"

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
            ws: {
                intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MEMBERS", "GUILD_BANS"]
            },
            restRequestTimeout: 15000
            // Options for discord.js go here.
        });

        console.log(`Initializing EFTClient ${VERSION}`)
        
        this.botVersion = VERSION
        this.config = JSON.parse(fs.readFileSync(path.join(process.cwd(), "config.json")).toString())
        this.configServer = JSON.parse(fs.readFileSync(path.join(process.cwd(), "configServer.json")).toString())

        // Create Command Handler instance.
        this.commandHandler = new CommandHandler(this, {
            directory: path.join(__dirname, "commands"), // Directory the commands are loaded from
            prefix: this.config.CommandPrefix, // The command prefix
            blockClient: true,
            blockBots: true,
            allowMention: false,
            commandUtil: true,
            fetchMembers: true, // Fetch message authors for commands instead of grabbing from cache
            defaultCooldown: this.config.CommandDelay * 1000,
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

        this.muteHandler = new MuteHandler(this)
        this.mmBoardHandler = new MiddlemanBoardHandler(this)
        this.warnHandler = new WarnHandler(this)

        console.log("Loading command files")
        this.commandHandler.loadAll() // Load all commands

        console.log("Loading inhibitor files")
        this.inhibitorHandler.loadAll()

        console.log("Loading listener files")
        this.listenerHandler.loadAll()

        console.log("Opening bot database")
        this.databaseHandler.loadData()

        this.addListener("error", (error) => console.error(`Discord client error: ${error}`))
        this.addListener("warn", (info) => console.error(`Discord client warning: ${info}`))
        this.addListener("rateLimit", (info) => console.error(`Ratelimit triggered.\tTimeout: ${info.timeout}ms\tPath: ${info.path}\tMethod: ${info.method}\tRoute: ${info.route}`))
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
    isStaffMember(member)
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

    /**
     *
     *
     * @param {EFTClient} client
     * @returns
     * @memberof EFTClient
     */
    async updateStatus(client)
    {
        let guild = client.getGuild()
        return await client.user.setActivity({
            type: "LISTENING",
            name: `${guild.memberCount} members`
        })
    }
}

module.exports = EFTClient