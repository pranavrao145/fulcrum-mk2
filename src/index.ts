// set env
import * as dotenv from 'dotenv';
dotenv.config();

// import all necessary modules
import Discord from 'discord.js';
import { Client } from 'pg';
import * as database from './utils/database'

const client: any = new Discord.Client(); // initialize client object
const prefix = "f!"; // declare prefix

// DATABASE CONNECTION

// declare database connection and options
const con = new Client({
    //connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    }
})

// connect to database
database.connect(con);

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



