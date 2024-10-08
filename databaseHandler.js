/// <reference path="typings/eft.d.ts">/>

const { Sequelize, DataTypes } = require("sequelize")
const EFTClient = require("./eftClient")
const config = require("./config.json")
const fs = require("fs")
const path = require("path")
const { GuildMember } = require("discord.js")

/**
 *
 * @property {Sequelize} db
 * @class DatabaseHandler
 */
class DatabaseHandler {
    /**
     *Creates an instance of DatabaseHandler.
     * @param {EFTClient} client
     * @memberof DatabaseHandler
     */
    constructor(client)
    {
        this.client = client
        console.log("Initializing database handler")

        const db = new Sequelize(config.DatabaseName, config.DatabaseUsername, config.DatabasePassword, {
            dialect: "mysql",
            host: config.DatabaseHost,
            port: config.DatabasePort,
            retry: {
                max: 5
            },
            logging: false
            //logging: console.debug
        })
        this.db = db

        console.log("Creating Sequelize DB models")
        
        const Ban = db.define("ban", {
            ban_id: { 
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            member_id: { // The ID of the member that was banned.
                type: DataTypes.BIGINT,
                allowNull: false,
            },
            ban_reason: { // The specified reason for the ban
                type: DataTypes.STRING,
                allowNull: true,
            },
            ban_date: { // The date and time of the ban
                type: DataTypes.DATE,
                allowNull: false,
            },
            ban_issuer: { // The ID of the staff member that issued the ban.
                type: DataTypes.BIGINT,
                allowNull: false,
            },
            is_scammer: { // Whether the user was banned for scamming.
                type: DataTypes.BOOLEAN,
                allowNull: false,
            }
        })
        
        const Member = db.define("member", {
            member_id: {
                type: DataTypes.BIGINT,
                allowNull: false,
                primaryKey: true,
                comment: "Discord Member ID"
            },
            member_name: {
                type: DataTypes.STRING,
                allowNull: false,
                comment: "Discord Username/Tag"
            },
            account_creation_date: {
                type: DataTypes.DATE,
                allowNull: false,
                comment: "The date/time the member's discord account was created"
            },
            accept_date: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW,
                comment: "The date/time the member used the accept command"
            },
            reputation: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
                allowNull: false,
                comment: "The member's reputation"
            },
            mm_reputation: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
                allowNull: false,
                comment: "The member's middleman reputation"
            },
            is_banned: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
                allowNull: false,
                comment: "Whether the user is banned"
            },
            is_active: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
                allowNull: false,
                comment: "Whether the user is 'active'"
            }
        })

        const Warn = db.define("warn", {
            id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            member_id: {
                type: DataTypes.BIGINT,
                allowNull: false,
            },
            issuer_id: {
                type: DataTypes.BIGINT,
                allowNull: false,
            },
            reason: {
                type: DataTypes.STRING,
                allowNull: false
            },
            active: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true
            },
            issued_date: {
                type: DataTypes.DATE,
                allowNull: false
            }
        })

        const Mute = db.define("mute", {
            member_id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                allowNull: false
            },
            end_date: {
                type: DataTypes.DATE,
                allowNull: false
            },
            issuer_id: {
                type: DataTypes.BIGINT,
                allowNull: false,
            },
            issued_date: {
                type: DataTypes.DATE,
                allowNull: false
            }
        })

        this.bans = Ban
        this.members = Member
        this.warns = Warn
        this.mutes = Mute
        this.db = db
        
    }

    /**
     * Connect and authenticate with the database
     *
     * @memberof DatabaseHandler
     */
    async loadData() {
        try {
            await this.db.authenticate();
            console.log('Connection has been established to mysql database successfully.');
        } catch (error) {
            console.error('Unable to connect to the database:', error);
            return process.exit(1)
        }

        console.log("Syncing models with database")

        if (fs.existsSync(path.join(process.cwd(), "fdbalter")))
        {
            console.log("fdbalter file found; Syncing database models with ALTER")
            this.db.sync({
                alter: true,
                logging: console.debug
            })
            fs.rmSync(path.join(process.cwd(), "fdbalter"))
        }
        else
        {
            this.db.sync()
        }

        console.log(`There are ${await this.members.count()} members and ${await this.bans.count()} banned members in the database.`)
    }

    /**
     * Query the database for the provided member id
     *
     * @param {string} id - The id of the discord member
     * @returns {DBMember}
     * @memberof DatabaseHandler
     */
    async getMemberById(id) {
        return await this.members.findOne({ 
            where: { 
                member_id: id 
            } 
        })
    }

    /**
     * Check the database to see if a row with the provided member's id exists in the ban table.
     *
     * @param {string} id - The id of the discord member
     * @returns {bool} Is a matching entry found in the database for this member id?
     * @memberof DatabaseHandler
     */
    async isMemberBanned(id) {
        let entry = await this.bans.findOne({ 
            where: { 
                member_id: id 
            } 
        })

        return entry != null
    }

    /**
     * Check if a member exists in the database
     *
     * @param {string} id - The id of the discord member
     * @returns
     * @memberof DatabaseHandler
     */
    async memberExists(id) {
        return await this.getMemberById(id) != null
    }

    /**
     * Get all warns for a member
     *
     * @param {string} id - The id of the discord member
     * @param {boolean} all - Whether to get all the user's warns, not just active ones
     * @returns
     * @memberof DatabaseHandler
     */
    async getWarns(id, all) {
        return await this.warns.findAll({
            where: {
                member_id: id,
                active: !all
            },
            order: [["issued_date", "ASC"]]
        })
    }

    /**
     * Remove all warns for a member
     *
     * @param {string} id - The id of the discord member
     * @returns
     * @memberof DatabaseHandler
     */
    async clearWarns(id) {
        return await this.warns.update({
            active: false
        },{
            where: {
                member_id: id,
                active: true
            }
        })
    }

    /**
     *
     * @param {string} id - The id of the discord member
     * @returns {Mute}
     * @memberof DatabaseHandler
     */
    async getMute(id) {
        return await this.mutes.findOne({
            where: {
                member_id: id
            }
        })
    }

    /**
     * Get all members in the database
     *
     * @returns {Array<DBMember>}
     * @memberof DatabaseHandler
     */
    async getMembers()
    {
        return await this.members.findAll()
    }

    /**
     * Get all mutes in the database
     *
     * @returns {Array<Mute>}
     * @memberof DatabaseHandler
     */
    async getMutes()
    {
        return await this.mutes.findAll()
    }

    /**
     * Get all warns in the database
     *
     * @returns {Promise<Array<Warn>>}
     * @memberof DatabaseHandler
     */
    async getAllWarns()
    {
        return await this.warns.findAll()
    }

    /**
     * @param {GuildMember} member
     * @returns
     * @memberof DatabaseHandler
     */
    async addMember(member)
    {
        return await this.members.create({
            member_id: member.id,
            member_name: member.user.username + "#" + member.user.discriminator,
            account_creation_date: member.user.createdAt,
            accept_date: Date.now(),
            is_active: true
        }).catch((reason) => {
            console.error(`Failed to add new member ${member.id} to the database. (${reason})`)
        })
    }


    /**
     * Get all bans in the database
     *
     * @returns {Array<Ban>}
     * @memberof DatabaseHandler
     */
    async getBans()
    {
        return await this.bans.findAll()
    }

    /**
     * @param {string} memberId
     * @param {string} issuerId
     * @param {string} memberId
     * @param {boolean} scammer
     *
     * @returns
     * @memberof DatabaseHandler
     */
    async addBan(memberId, issuerId, reason, scammer)
    {
        return await this.bans.create({
            member_id: memberId,
            ban_issuer: issuerId,
            ban_date: Date.now(),
            ban_reason: reason,
            is_scammer: scammer
        })
    }

    /**
     * @param {string} memberId
     * @param {string} issuerId
     * @param {string} endDate
     * @param {boolean} scammer
     *
     * @returns
     * @memberof DatabaseHandler
     */
    async addMute(memberId, issuerId, endDate)
    {
        return await this.mutes.create({
            member_id: memberId,
            issuer_id: issuerId,
            issued_date: Date.now(),
            end_date: endDate
        })
    }

    /**
     * @param {number} warnId
     * @returns
     * @memberof DatabaseHandler
     */
    async removeWarn(warnId)
    {
        return await this.warns.update({
            active: false // Don't actually remove the warning from the database, just make it inactive
        }, {
            where: {
                id: warnId
            }
        })
    }

    /**
     * @param {number} memberId
     * @returns
     * @memberof DatabaseHandler
     */
    async removeMute(memberId)
    {
        return await this.mutes.destroy({
            where: {
                member_id: memberId
            }
        })
    }

    /**
     * @param {string} memberId
     * @param {string} issuerId
     * @param {string} reason
     *
     * @returns
     * @memberof DatabaseHandler
     */
    async addWarn(memberId, issuerId, reason)
    {
        return await this.warns.create({
            member_id: memberId,
            issuer_id: issuerId,
            reason: reason,
            issued_date: Date.now(),
        })
    }

    /**
     * Update a member's data in the database
     *
     * @param {string} id
     * @param {DBMember} member
     * @memberof DatabaseHandler
     */
    async updateMember(id, member)
    {
        return await this.members.update(member, {
            where: {
                member_id: id
            }
        }).catch((reason) => console.error(`SQL Update of member ${id} failed:`, reason))
    }

    /**
     * Get the reputation of a member
     *
     * @param {string} id
     * @memberof DatabaseHandler
     */
    async getReputation(id)
    {
        let member = await this.members.findOne({
            attributes: ["reputation"],
            where: {
                member_id: id
            }
        }).catch((reason) => console.error(`Getting reputation of member ${id} failed:`, reason))

        return member && member.reputation
    }

    /**
     *
     *
     * @memberof DatabaseHandler
     */
    async getReputationTop(num)
    {
        return await this.members.findAll({
            limit: num,
            order: [
                ["reputation", "DESC"] // Sort descending by reputation
            ],
            where: {
                is_active: true
            }
        })
    }

    /**
     *
     *
     * @memberof DatabaseHandler
     */
    async getMMReputationTop(num)
    {
        return await this.members.findAll({
            limit: num,
            order: [
                ["mm_reputation", "DESC"] // Sort descending by middleman reputation
            ],
            where: {
                is_active: true
            }
        })
    }

    /**
     * Set the reputation of a member
     *
     * @param {string} id
     * @param {number} num
     * @memberof DatabaseHandler
     */
    async setReputation(id, num)
    {
        return await this.members.update({
            reputation: num,
            active: true // Member has to be in the server to receive reputation, so we'll just always set this to true.
        }, {
            where: {
                member_id: id
            }
        }).catch((reason) => console.error(`Setting reputation of member ${id} failed:`, reason))
    }

    /**
     * Get the middleman reputation of a member
     *
     * @param {string} id
     * @memberof DatabaseHandler
     */
    async getMMReputation(id)
    {
        let member = await this.members.findOne({
            attributes: ["mm_reputation"],
            where: {
                member_id: id
            }
        }).catch((reason) => console.error(`Getting reputation of member ${id} failed:`, reason))

        return member.mm_reputation
    }

    /**
     * Set the middleman reputation of a member
     *
     * @param {string} id
     * @param {number} num
     * @memberof DatabaseHandler
     */
    async setMMReputation(id, num)
    {
        return await this.members.update({
            mm_reputation: num,
            active: true // Member has to be in the server to receive reputation, so we'll just always set this to true.
        }, {
            where: {
                member_id: id
            }
        }).catch((reason) => console.error(`Setting reputation of member ${id} failed:`, reason))
    }
}

module.exports = DatabaseHandler;