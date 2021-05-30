// set env
import * as dotenv from 'dotenv';
dotenv.config();

// import all necessary modules
import Discord from 'discord.js' 
//import fs from 'fs'
//import schedule from 'node-schedule'

const client = new Discord.Client();

client.login(process.env.BOT_TOKEN).catch((err) => {
    throw err;
})

