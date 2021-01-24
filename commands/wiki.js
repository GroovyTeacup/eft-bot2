/// <reference path="../typings/eft.d.ts">/>

const { Command, TypeResolver } = require('discord-akairo');
const ContentParser = require('discord-akairo/src/struct/commands/ContentParser');
const { GuildMember } = require('discord.js');
const EFTMessage = require('../eftMessage');
const embedHelper = require("../embedHelper")
const https = require('https');
const { IncomingMessage } = require('http');

class SearchWikiCommands extends Command {
    constructor() {
        super('searchwiki', {
           aliases: ["wiki"],
           clientPermissions: ["SEND_MESSAGES"],
           channel: "guild",
           typing: true,
        });
    }

    /**
     * Parses content using the command's arguments.
     * This function is a clusterfuck and pretty un-necessary lmao
     * @param {EFTMessage} message
     * @memberof BanCommand
     */
    async parse(message)
    {
        let ret
        let parser = new ContentParser()

        let args = parser.parse(message.content).all
        if (args.length >= 1)
        {
            ret = ""
            for (let i = 1; i < args.length; i++)
            {
                ret += args[i].raw
            }
        }

        return ret
    }

    /**
     *
     *
     * @param {string} term
     * @returns {IncomingMessage}
     * @memberof SearchWikiCommands
     */
    async doSearch(term)
    {
        return new Promise((resolve, reject) => {
            https.get({
                hostname: "escapefromtarkov.gamepedia.com",
                path: `/api.php?action=opensearch&search=${term}&limit=1`,
                secureOptions: {

                },
                method: "GET",
                headers: {
                    "Content-Type": 'application/json',
                    "UserAgent": "Discord-EFTBot/" + this.client.botVersion
                }
            }, (res) => {
                if (res < 200 && res > 299) reject("Status code != 2xx")

                res.setEncoding('utf8');
                let rawData = '';
                res.on('data', (chunk) => { rawData += chunk; });
                res.on('end', () => {
                    try {
                        const parsedData = JSON.parse(rawData);
                        resolve(parsedData)
                    } catch (e) {
                        reject(e.message)
                    }
                });
            })
        })
    }

    /**
     *
     *
     * @param {EFTMessage} message
     * @param {string} command
     * @returns
     * @memberof SearchWikiCommands
     */
    async exec(message, searchTerm) {
        if (searchTerm == null) {
            await message.reply("Usage: `!wiki <Search Term>`")
        }

        console.log(`${message.author.id} is searching the wiki for '${searchTerm}'`)

        let obj = await this.doSearch(searchTerm).catch((err) => {
            console.error(`${message.author.id}'s wiki search request failed. (${err})`)
        })

        if (obj == null) return await message.reply(embedHelper.makeError(this.client, "API request failed. Try again?"))

        if (obj.length < 4) {
            return await message.reply(embedHelper.makeError(this.client, "Bad API response. Try again?"))
        }

        let links = obj[3]

        if (links && links.length > 0) {
            await message.reply(links[0])
        } else {
            await message.reply(embedHelper.makeError(this.client, `No results found on the wiki for the search term \`${searchTerm}\``))
        }
    }
}

module.exports = SearchWikiCommands;