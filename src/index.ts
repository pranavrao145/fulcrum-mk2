// set env
import * as dotenv from 'dotenv';
dotenv.config();

// import all necessary modules
import Discord from 'discord.js';
import { Client } from 'pg';

// declare all necessary constants
const client: any = new Discord.Client(); // declare client object
const prefix = "f!"; // declare prefix

// DATABASE CONNECTION

// declare database connection
const con = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    }
})

// establish database connection
con.connect((err: any) => {
    if (err) throw err;
    console.log("Connected to database!");
})

// BOT EVENTS

// log in as bot 
client.login(process.env.BOT_TOKEN).catch((err: any) => {
    throw err;
})

// on ready, set status and log presence data
client.on("ready", () => {
    console.log(`Logged in as ${client.user!.tag}!`);
    console.log(client.guilds.cache.size)
    client.user!.setPresence({
        status: "online",
        activity: {
            name: "f!help",
            type: "WATCHING",
        },
    })
    .then((presence: any) => console.log(presence)).catch();
});



