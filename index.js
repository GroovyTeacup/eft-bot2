/// <reference path="typings/eft.d.ts">/>

const EFTBot = require("./eftClient")
const client = new EFTBot(process.env.OWNER_ID);

global.clientInstance = client // global variable mostly for debugging

console.log("Logging into discord")
client.login(process.env.TOKEN).then(() => {
    console.log("Logged into discord!")
}).catch((reason) => {
    console.error(`Failed to log into discord! (${reason})`)
    console.error("Quitting...")
    process.exit(1)
});