import { Message } from 'discord.js';
import { Command } from '../utils/types';
import { Client } from 'pg';
import { getRoleFromMention, getUserFromMention } from '../utils/helpers';

const command: Command = {
    name: 'assignrole',
    description: 'Adds the given role to the given user(s). Max 10 users mentionable with one command.',
    alias: ['ar'],
    syntax: 'f!assignrole [role] [user mentions (10 max)]',
    async execute(message: Message, con?: Client, args?: string[]) {
        if (!message.member || !message.guild) return; // check if the member that sent this message and its guild exists

        console.log(`Assign role function started by user ${message.member.user.tag} in guild ${message.guild.name}.`);

        if (!message.member.hasPermission('MANAGE_ROLES')) { // check for adequate permissions
            console.log('Checking permissions...')
            try {
                console.log('Insufficient permissions, stopping execution.')
                return await message.reply('sorry, you need to have the MANAGE_ROLES permission to use this command.');
            } catch (e) {
                console.log(`There was an error sending a message in the guild ${message.guild}! The error message is below:`);
                console.log(e);
            }
        }

        if (!args || args.length < 2 || args.length > 11) { // check if the args exist (this function requires them) and that there are not too many args
            console.log('Checking validity of arguments...')
            try {
                console.log('Incorrect syntax given, stopping execution.');
                return await message.channel.send('Incorrect syntax! Correct syntax: f!assignrole: [role] [user mentions (10 max)]')
            } catch (e) {
                console.log(`There was an error sending a message in the guild ${message.guild}! The error message is below:`);
                console.log(e);
            }
        }

        const roleMention = args!.shift(); // find the mention of the role in the args
        const role = getRoleFromMention(message, roleMention!); // get the role object

        for (const mention of args!) { // iterate through all the user mentions
            const user = getUserFromMention(message, mention); // get the user for the mention

            if (!user) { // check if the user actually exists
                console.log('A user supplied was not valid. Skipping over them.');
                continue;
            }

            try {
                const addedRole = await user.roles.add(role!);
                 
            } catch (e) {

            }
        }
    }
}
