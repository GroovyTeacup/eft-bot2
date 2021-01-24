const { User } = require("discord.js")
const { GuildMember } = require("discord.js")
const { MessageEmbed } = require("discord.js")
const EFTClient = require("./eftClient")

/**
 *
 *
 * @param {EFTClient} client
 * @param {string} message
 * @param {string} title
 * @returns
 */
function makeError(client, message, title) {
    const avatarURL = client.user.avatarURL()
    return new MessageEmbed()
    .setTitle(title ? title : "Oops!")
    .setDescription(message)
    .setColor(0xff0000)
    .setFooter("EFT TC", avatarURL)
    .setTimestamp(Date.now())
}

/**
 *
 *
 * @param {EFTClient} client
 * @param {string} message
 * @param {string} title
 * @returns
 */
function makeSuccess(client, message, title) {
    const avatarURL = client.user.avatarURL()

    return new MessageEmbed()
    .setTitle(title ? title : "Success!")
    .setDescription(message)
    .setColor(0x00ff00)
    .setFooter("EFT TC", avatarURL)
    .setTimestamp(Date.now())
}

/**
 *
 *
 * @param {EFTClient} client
 * @param {string} message
 * @param {string} title
 * @returns
 */
function makeSimpleEmbed(client, message, title, color=0xff0000) {
    const avatarURL = client.user.avatarURL()

    return new MessageEmbed()
    .setTitle(title)
    .setDescription(message)
    .setColor(color)
    .setFooter("EFT TC", avatarURL)
    .setTimestamp(Date.now())
}

module.exports.makeError = makeError
module.exports.makeSuccess = makeSuccess
module.exports.makeSimpleEmbed = makeSimpleEmbed