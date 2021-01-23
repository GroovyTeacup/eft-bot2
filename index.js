/// <reference path="typings/eft.d.ts">/>

const EFTClient = require("./eftClient")
const client = new EFTClient(process.env.OWNER_ID);

global.clientInstance = client // global variable mostly for debugging

console.log("Logging into discord")
client.login(process.env.TOKEN).then(() => {
    console.log("Logged into discord!")
}).catch((reason) => {
    console.error(`Failed to log into discord! (${reason})`)
    console.error("Quitting...")
    process.exit(1)
});