const EFTClient = require("./eftClient")
const { DateTime } = require("luxon")

/**
 *
 * @class WarnHandler
 */
class WarnHandler {
    /**
     * Creates an instance of WarnHandler.
     * @param {EFTClient} client
     * @memberof WarnHandler
     */
    constructor(client) {
        this.client = client
        this.dbHandler = client.databaseHandler
        //this.warns = []
        
        client.addListener("ready", async () => {
            //this.warns = await this.dbHandler.getAllWarns()

            //console.log(`Loaded ${warns.length} existing warns in the database.`)

            this.warnUpdateTimer = setInterval(async () => {
                let warns = await this.dbHandler.getAllWarns()

                for (const warn of warns)
                {
                    if (!warn.active) continue
                    
                    let issuedDate = DateTime.fromJSDate(warn.issued_date)
                    if (DateTime.local() >= issuedDate.plus({days: 90}))
                    {
                        await this.dbHandler.removeWarn(warn.id).catch((err) => console.error(`Failed to set warn ${warn.id} to inactive:`, err))

                        console.log(`${warn.member_id}'s warn (ID ${warn.id}) has been made inactive after 90 days.`)
                    }
                }
            }, 1000 * 60 * 60)
        })
    }
}

module.exports = WarnHandler