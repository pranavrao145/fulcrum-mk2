// set env 
import * as dotenv from 'dotenv';
dotenv.config();

// import all necessary modules
import Discord from 'discord.js';
import {Client} from 'pg';
import * as database from './utils/database';
import glob from 'glob'
import {promisify} from 'util'
import {ICommand} from './utils/types'

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
        const command = await import(file);
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

client.on('voiceStateUpdate', async (oldState: Discord.VoiceState, newState: Discord.VoiceState) => { // detect when voice state changes to add/remove voice channel roles // detect when voice state changes to add/remove voice channel roles // detect when voice state changes to add/remove voice channel roles // detect when voice state changes to add/remove voice channel roles
    // three situations exist:
    // 1. User leaves all voice channels
    // 2. User joins a voice channel from no voice channel
    // 3. User joins a voice channel from another voice channel

    if (!oldState.member || !newState.member) return; // check if the voice state change actually involves members
    if (!oldState.guild || !newState.guild) return; // check if the voice state change actually involves a guild

    if (oldState.channel && !newState.channel) { // if the user leaves all voice channels
        console.log(`User ${oldState.member!.user.tag} left all voice channels in ${newState.guild.name}`)
        const oldRole = oldState.guild.roles.cache.find(r => r.name === oldState.channel!.name); // find the voice channel role associated with the voice channel   

        if (!oldRole) { // if there is no voice role associated with the old voice channel
            console.log(`No voice channel role found for channel ${oldState.channel.name}. Stopping execution.`);
            return;
        }

        try { // attempt to remove the role for the old voice channel
            await oldState.member.roles.remove(oldRole);
            console.log(`Removed voice channel role ${oldRole.name} from ${oldState.member.user.tag} in guild ${oldState.guild.name}.`);
        } catch (e) {
            console.log(`Failed to remove voice channel role ${oldRole.name} from ${oldState.member.user.tag} in guild ${oldState.guild.name}.`);
        }
    }
    else if (!oldState.channel && newState.channel) { // if the user moved from no channel to a voice channel
        console.log(`User ${newState.member!.user.tag} joined voice channel in ${newState.guild.name}`);
        const newRole = newState.guild.roles.cache.find(r => r.name === newState.channel!.name); // find the voice channel role associated with the voice channel   

        if (!newRole) { // if there is no voice role associated with the new voice channel
            console.log(`No voice channel role found for channel ${newState.channel.name}. Stopping execution.`);
            return;
        }

        try { // attempt to add the role for the new voice channel
            await newState.member.roles.add(newRole);
            console.log(`Added voice channel role ${newRole.name} to ${newState.member.user.tag} in guild ${newState.guild.name}.`);
        } catch (e) {
            console.log(`Failed to add voice channel role ${newRole.name} to ${newState.member.user.tag} in guild ${newState.guild.name}.`);
        }
    } else if (oldState.channel && newState.channel) { // if the user moves from one channel to another
        console.log(`User ${newState.member!.user.tag} moved from one voice channel to another in ${newState.guild.name}`);
        const oldRole = oldState.guild.roles.cache.find(r => r.name === oldState.channel!.name); // find the voice channel role associated with the old voice channel   
        const newRole = newState.guild.roles.cache.find(r => r.name === newState.channel!.name); // find the voice channel role associated with the new voice channel   

        if (oldRole) { // if there is a voice role associated with the old voice channel
            console.log(`Role for old voice channel ${oldState.channel.name} found. Attempting to remove role from user.`);

            try { // attempt to remove the role for the old voice channel
                await oldState.member.roles.remove(oldRole);
                console.log(`Removed voice channel role ${oldRole.name} from ${oldState.member.user.tag} in guild ${oldState.guild.name}.`);
            } catch (e) {
                console.log(`Failed to remove voice channel role ${oldRole.name} from ${oldState.member.user.tag} in guild ${oldState.guild.name}.`);
            }

        }

        if (newRole) { // if there is a voice role associated with the new voice channel
            console.log(`Role for new voice channel ${newState.channel.name} found. Attempting to add role to user.`);
            try { // attempt to add the role for the new voice channel
                await newState.member.roles.add(newRole);
                console.log(`Added voice channel role ${newRole.name} to ${newState.member.user.tag} in guild ${newState.guild.name}.`);
            } catch (e) {
                console.log(`Failed to add voice channel role ${newRole.name} to ${newState.member.user.tag} in guild ${newState.guild.name}.`);
            }
        }
    }
    console.log('Voice channel role update sequence completed successfully.');
})
