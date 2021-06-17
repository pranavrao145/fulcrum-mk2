// set env
import * as dotenv from 'dotenv';
dotenv.config();

// import all necessary modules
import Discord from 'discord.js';
import { Client } from 'pg';
import * as database from './utils/database';
import glob from 'glob'
import { promisify } from 'util'
import { ICommand } from './utils/types'

const client: Discord.Client = new Discord.Client(); // initialize client object
const prefix = 'f!'; // declare prefix

// DATABASE CONNECTION

// declare database connection and options
const con = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    }
})

// connect to database
database.connect(con);

// BOT PREP

// prepare to read command files
const globPromise = promisify(glob);
const commands: Array<ICommand> = [];

// BOT EVENTS

// log in as bot 
client.login(process.env.BOT_TOKEN).catch((err: any) => {
    throw err;
})

// on ready, set status and log presence data
client.on('ready', async () => {
    // load in command files
    const commandFiles = await globPromise(`${__dirname}/commands/*.{js,ts}`); // identify command files
    
    for (const file of commandFiles) {
        const command = await import (file); 
        commands.push(command);
        console.log(`Command ${command.name} loaded successfully.`);
    } 

    console.log(`Logged in as ${client.user!.tag}!`);
    console.log(client.guilds.cache.size);

    try {
        await client.user!.setPresence({
            status: 'online',
            activity: {
                name: 'f!help',
                type: 'WATCHING'
            },
        })
    }
    catch (e) {
        console.log('There was an error setting the bot status. The error message is below:');
        console.log(e)
    }
});

client.on('message', async (message: Discord.Message) => {
    // check if the message contains the prefix, and is not by a bot or in a dm 
    if (!message.content.toLowerCase().startsWith(prefix) || message.author.bot || message.guild === null) return;

    if (!message.member || !message.guild) return; // check if the member that sent this message and its guild exists

    console.log(`Message received from user ${message.member.user.tag}. Checking for valid commands.`)

    // parse the message for the correct command and find the associated command file
    const [commandName, ...args] = message.content.slice(prefix.length).trim().split(/ +/);

    console.log(`Potential command name: ${commandName}`);
    console.log(`Potential arguments: ${args}`);

    const command = commands.find(c => c.name === commandName || (c.alias ? c.alias!.includes(commandName) : false));

    // if the command is found, execute it
    if (command) {
        command.execute(message, con, args);
    }
    else {
        console.log('No command found, ignoring message.')
    }
});

client.on('voiceStateUpdate', (oldState, newState) => { // detect when voice state changes to add/remove voice channel roles // detect when voice state changes to add/remove voice channel roles // detect when voice state changes to add/remove voice channel roles // detect when voice state changes to add/remove voice channel roles
    // three situations exist:
    // 1. User leaves all voice channels
    // 2. User joins a voice channel from no voice channel
    // 3. User joins a voice channel from another voice channel

    if (oldState.channel && !newState.channel) { // if the user leaves all voice channels
        const oldRole = oldState.guild.roles.cache.find(r => r.name === oldState.channel!.name); // find the voice channel role associated with the voice channel   
    }
}) 
