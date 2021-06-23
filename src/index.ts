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
    const commandFiles = await globPromise(`${__dirname}/commands/**/*.{js,ts}`); // identify command files

    for (const file of commandFiles) {
        const command = await import(file);
        commands.push(command);
        console.log(`Command ${command.name} loaded successfully.`);
    }

    console.log(`Logged in as ${client.user!.tag}!`);
    console.log(`Currently in ${client.guilds.cache.size} guilds!`);

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

// on a message, parse message for commands and execute accordingly
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

// on a voice state change, add/remove the appropriate voice channel roles 
client.on('voiceStateUpdate', async (oldState: Discord.VoiceState, newState: Discord.VoiceState) => {     
    // three situations exist:
    // 1. User leaves all voice channels
    // 2. User joins a voice channel from no voice channel
    // 3. User joins a voice channel from another voice channel

    if (!oldState.member || !newState.member) return; // check if the voice state change actually involves members
    if (!oldState.guild || !newState.guild) return; // check if the voice state change actually involves a guild

    console.log(`Voice state update detected in ${oldState.guild}. Attempting to assign correct voice channel roles.`)

    if (oldState.channel && !newState.channel) { // if the user leaves all voice channels
        console.log(`User ${oldState.member!.user.tag} left all voice channels in guild.`)
        const oldRole = oldState.guild.roles.cache.find(r => r.name === oldState.channel!.name); // find the voice channel role associated with the voice channel   

        if (!oldRole) { // if there is no voice role associated with the old voice channel
            console.log(`No voice channel role found for channel ${oldState.channel.name}. Stopping execution.`);
            return;
        }

        try { // attempt to remove the role for the old voice channel
            await oldState.member.roles.remove(oldRole);
            console.log(`Removed voice channel role ${oldRole.name} from ${oldState.member.user.tag}.`);
        } catch (e) {
            console.log(`Failed to remove voice channel role ${oldRole.name} from ${oldState.member.user.tag}.`);
        }
    }
    else if (!oldState.channel && newState.channel) { // if the user moved from no channel to a voice channel
        console.log(`User ${newState.member!.user.tag} joined voice channel in guild.`);
        const newRole = newState.guild.roles.cache.find(r => r.name === newState.channel!.name); // find the voice channel role associated with the voice channel   

        if (!newRole) { // if there is no voice role associated with the new voice channel
            console.log(`No voice channel role found for channel ${newState.channel.name}. Stopping execution.`);
            return;
        }

        try { // attempt to add the role for the new voice channel
            await newState.member.roles.add(newRole);
            console.log(`Added voice channel role ${newRole.name} to ${newState.member.user.tag}.`);
        } catch (e) {
            console.log(`Failed to add voice channel role ${newRole.name} to ${newState.member.user.tag}.`);
        }
    } else if (oldState.channel && newState.channel) { // if the user moves from one channel to another
        console.log(`User ${newState.member!.user.tag} moved from one voice channel to another in guild.`);
        const oldRole = oldState.guild.roles.cache.find(r => r.name === oldState.channel!.name); // find the voice channel role associated with the old voice channel   
        const newRole = newState.guild.roles.cache.find(r => r.name === newState.channel!.name); // find the voice channel role associated with the new voice channel   

        if (oldRole) { // if there is a voice role associated with the old voice channel
            console.log(`Role for old voice channel ${oldState.channel.name} found. Attempting to remove role from user.`);

            try { // attempt to remove the role for the old voice channel
                await oldState.member.roles.remove(oldRole);
                console.log(`Removed voice channel role ${oldRole.name} from ${oldState.member.user.tag}.`);
            } catch (e) {
                console.log(`Failed to remove voice channel role ${oldRole.name} from ${oldState.member.user.tag}.`);
            }

        }

        if (newRole) { // if there is a voice role associated with the new voice channel
            console.log(`Role for new voice channel ${newState.channel.name} found. Attempting to add role to user.`);
            try { // attempt to add the role for the new voice channel
                await newState.member.roles.add(newRole);
                console.log(`Added voice channel role ${newRole.name} to ${newState.member.user.tag}.`);
            } catch (e) {
                console.log(`Failed to add voice channel role ${newRole.name} to ${newState.member.user.tag}.`);
            }
        }
    }

    console.log(`Automatic voice channel role update sequence completed successfully in guild ${oldState.guild}.`)
})

// every time a voice channel is created, set up the associated voice channel role automatically
client.on('channelCreate', async (channel: Discord.Channel) => {    
    if (!channel) return; // ensure that the channel created exists 
    if (channel.type !== 'voice') return; // ensure the channel created is a voice channel
    if (!(channel as Discord.VoiceChannel).guild) return; // check that the voice channel is actually associated with a guild

    console.log(`Voice channel creation detected in guild ${(channel as Discord.VoiceChannel).guild}.`);

    const vcRole = (channel as Discord.VoiceChannel).guild.roles.cache.find(r => r.name === (channel as Discord.VoiceChannel).name); // attempt to find a role in the server with the same name as the channel

    if (vcRole) { // check if the role already exists
        console.log(`Voice channel role already exists for voice channel ${(channel as Discord.VoiceChannel).name}. Doing nothing.`);
        return;
    }

    try {
        const vcRoleCreated = await (channel as Discord.VoiceChannel).guild.roles.create({ // create the role with the same name as the voice channel
            data: {
                name: (channel as Discord.VoiceChannel).name,
            }
        });
        console.log(`Role ${vcRoleCreated.name} created successfully.`)
    } catch (e) {
        console.log(`Failed to create role ${(channel as Discord.VoiceChannel).name}. The error message is below:`)
        console.log(e);
    }

    console.log(`Automatic voice channel role creation sequence completed successfully in ${(channel as Discord.VoiceChannel).guild}.`);
    
}) 

// every time a voice channel is deleted, delete the associated voice channel role automatically
client.on('channelDelete', async (channel: Discord.Channel) => {    
    if (!channel) return; // ensure that the channel deleted existed 
    if (channel.type !== 'voice') return; // ensure the channel deleted was a voice channel
    if (!(channel as Discord.VoiceChannel).guild) return; // check that the voice channel was actually associated with a guild

    console.log(`Voice channel deletion detected in guild ${(channel as Discord.VoiceChannel).guild}.`);

    const vcRole = (channel as Discord.VoiceChannel).guild.roles.cache.find(r => r.name === (channel as Discord.VoiceChannel).name); // attempt to find a role in the server with the same name as the channel

    if (!vcRole) { // check if the role already exists
        console.log(`Voice channel role already does not exist for voice channel ${(channel as Discord.VoiceChannel).name}. Doing nothing.`);
        return;
    }

    try {
        const vcRoleDeleted = await vcRole.delete(); // delete the role with the same name as the voice channel
        console.log(`Role ${vcRoleDeleted.name} deleted successfully.`);
    } catch (e) {
        console.log(`Failed to delete role ${(channel as Discord.VoiceChannel).name}. The error message is below:`)
        console.log(e);
    }

    console.log(`Automatic voice channel role deletion sequence completed successfully in ${(channel as Discord.VoiceChannel).guild}.`);
}) 
