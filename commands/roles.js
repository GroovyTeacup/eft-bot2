/// <reference path="../typings/eft.d.ts">/>

const { Command, TypeResolver } = require('discord-akairo');
const ContentParser = require('discord-akairo/src/struct/commands/ContentParser');
const { User } = require('discord.js');
const { GuildMember } = require('discord.js');
const EFTMessage = require('../eftMessage');
const embedHelper = require("../embedHelper")

class RoleCommands extends Command {
    constructor() {
        super('rolecommands', {
           aliases: ['bear', "usec", "scammerupdates"],
           clientPermissions: ["SEND_MESSAGES", "MANAGE_ROLES"],
           channel: "guild",
           typing: false,
        });
    }

    async toggleRole(member, id, message) {
        let server = this.client.getGuild()
        let role = server.roles.resolve(id, server.roles.cache)

        if (role == null){
            console.error(`${member.id} tried to assign themselves the role ${id} but it doesn't exist.`)
            return await message.reply(embedHelper.makeError(this.client, "It seems this role doesn't exist for some reason."))
        }

        if (role.permissions.has("ADMINISTRATOR"))
        {
            return await message.reply(embedHelper.makeError(this.client, "You cannot toggle an administrator role."))
        }

        if (!member.roles.cache.has(id)) {
            await member.roles.add(id)
            await message.reply(embedHelper.makeSuccess(this.client, `You have been given the ${role} role.`, "Role Assigned"))
            console.log(`${member.id} has assigned themselves the role ${id}`)
        } else {
            await member.roles.remove(id)
            await message.reply(embedHelper.makeSuccess(this.client, `Your ${role} role has been removed.`, "Role Removed"))
            console.log(`${member.id} has removed the role ${id} from themselves.`)
        }
    }

    /**
     * Parses content using the command's arguments.
     * @param {EFTMessage} message
     * @memberof BanCommand
     */
    async parse(message)
    {
        let ret

        let parser = new ContentParser()

        let args = parser.parse(message.content).all
        if (args.length > 0)
        {
            ret = args[0].value.substr(1, args[0].value.length)
        }

        return ret
    }
    
    /**
     *
     *
     * @param {EFTMessage} message
     * @param {string} command
     * @returns
     * @memberof RoleCommands
     */
    async exec(message, command) {
        let configServer = this.client.configServer
        
        switch (command) {
            case "bear":
                this.toggleRole(message.member, configServer.BearRole, message)
                break;
            case "usec":
                this.toggleRole(message.member, configServer.USECRole, message)
                break;
            case "scammerupdates":
                this.toggleRole(message.member, configServer.ScammerUpdatesRole, message)
                break;
        
            default:
                break;
        }
    }
}

module.exports = RoleCommands;