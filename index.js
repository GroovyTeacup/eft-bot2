/// <reference path="typings/eft.d.ts">/>

const EFTClient = require("./eftClient")
const fs = require("fs")
const path = require("path")

if (!fs.existsSync(path.join(process.cwd(), "config.json")))
{
    console.error("Couldn't find config.json. Exiting...")
    process.exit(1)
}

if (!fs.existsSync(path.join(process.cwd(), "config.json")))
{
    console.error("Couldn't find config.json. Exiting...")
    process.exit(1)
}

const config = JSON.parse(fs.readFileSync(path.join(process.cwd(), "config.json")).toString())
const client = new EFTClient(process.env.OWNER_ID);

global.clientInstance = client // global variable mostly for debugging

console.log("Logging into discord.")

client.login(process.env.TOKEN || config.SecretToken).then(() => {
    console.log("Logged into discord!")
}).catch((reason) => {
    console.error(`Failed to log into discord! (${reason})`)
    console.error("Quitting...")
    process.exit(1)
});