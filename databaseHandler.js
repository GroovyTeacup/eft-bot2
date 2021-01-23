const api = require("./apiHandler")
const { Sequelize, DataTypes } = require("sequelize")
const { User } = require("discord.js")
const EFTBot = require("./eftClient")
const config = require("./config.json")

/**
 *
 * @property {Sequelize} db
 * @class DatabaseHandler
 */
class DatabaseHandler {
    /**
     *Creates an instance of DatabaseHandler.
     * @param {EFTBot} client
     * @memberof DatabaseHandler
     */
    constructor(client)
    {
        this.client = client
        console.log("Initializing database handler")

        const db = new Sequelize(config.DatabaseName, config.DatabaseUsername, config.DatabasePassword, {
            dialect: "mysql",
            retry: {
                max: 5
            },
            //logging: false
            logging: console.debug
        })
        this.db = db

        console.log("Creating Sequelize DB models")
        
        const Ban = db.define("Ban", {
            ban_id: { 
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true
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
                allowNull: true,
            },
            ban_issuer: { // The ID of the staff member that issued the ban.
                type: DataTypes.BIGINT,
                allowNull: true,
            },
            is_scammer: { // Whether the user was banned for scamming.
                type: DataTypes.BOOLEAN,
                allowNull: true,
            }
        })
        
        const Member = db.define("Member", {
            member_id: {
                type: DataTypes.BIGINT,
                allowNull: false,
                primaryKey: true
            },
            member_name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            account_creation_date: {
                type: DataTypes.DATE,
                allowNull: false
            },
            accept_date: {
                type: DataTypes.DATE,
                allowNull: false
            },
            reputation: {
                type: DataTypes.INTEGER,
            },
            mm_reputation: {
                type: DataTypes.INTEGER,
            },
            is_banned: {
                type: DataTypes.BOOLEAN,
            },
            is_active: {
                type: DataTypes.BOOLEAN,
            }
        })

        this.bans = Ban
        this.members = Member
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
        }

        console.log("Syncing models with database")

        await this.db.sync()
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
     * Set the reputation of a member
     *
     * @param {string} id
     * @param {number} num
     * @memberof DatabaseHandler
     */
    async setReputation(id, num)
    {
        return await this.members.update({
            reputation: num
        }, {
            where: {
                member_id: id
            }
        }).catch((reason) => console.error(`Setting reputation of member ${id} failed:`, reason))
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
            mm_reputation: num
        }, {
            where: {
                member_id: id
            }
        }).catch((reason) => console.error(`Setting reputation of member ${id} failed:`, reason))
    }
}

module.exports = DatabaseHandler;