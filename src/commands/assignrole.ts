import { Message, MessageEmbed } from 'discord.js';
import { Command } from '../utils/types';
import { Client } from 'pg';
import { getRoleFromMention, getUserFromMention, timeout } from '../utils/helpers';

const command: Command = {
    name: 'assignrole',
    description: 'Adds the given role to the given user(s). Max 10 users mentionable with one command.',
    alias: ['ar'],
    syntax: 'f!assignrole [role] [user mentions (10 max)]',
    async execute(message: Message, con: Client, args?: string[]) {
        console.log(`Command assignrole started by user ${message.member!.user.tag} in guild ${message.guild!.name}.`);

        let outputEmbed = new MessageEmbed() // create an embed to display the results of the command
        .setColor('#FFFCF4')
        .setTitle('Assign Roles - Report')
        .setDescription(`Command executed by ${message.member!.user.tag}`);

        if (!message.member!.hasPermission('MANAGE_ROLES')) { // check for adequate permissions
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

        if (!role) {
            console.log('Role supplied was invalid. Stopping execution.');
            try {
                await message.channel.send('Invalid role! Please check my permissions and try again.');
            } catch (e) {
                console.log(`There was an error sending a message in the guild ${message.guild}! The error message is below:`);
                console.log(e);
            }
        }

        for (const mention of args!) { // iterate through all the user mentions
            const member = getUserFromMention(message, mention); // get the user for the mention

            if (!member) { // check if the user actually exists
                console.log('A user supplied was not valid. Skipping over them.');
                outputEmbed.addField(`${mention}`, 'Invalid user or user not found');
                continue;
            }

            try {
                await timeout(500); // setting a short timeout to prevent abuse of Discord's API
                await member.roles.add(role!);
                console.log(`Role ${role!.name} added to ${member.user.tag} successfully.`)
                outputEmbed.addField(`${member.user.tag}`, 'Role added successfully');
            } catch (e) {
                console.log(`Failed to add role ${role!.name} to ${member.user.tag}.`)
                outputEmbed.addField(`${member.user.tag}`, 'Couldn\'t add role. Check permissions and try again.');
            }
        }

        try { // send output embed with information about the command's success
            if (outputEmbed.fields.length > 0) { // check if there are actually any fields to send the embed with
                await message.channel.send(outputEmbed);
            }
            console.log(`Command assignrole, started by ${message.member!.user.tag}, terminated successfully in ${message.guild}.`);
        } catch (e) {
            console.log(`There was an error sending a embed in the guild ${message.guild}! The error message is below:`);
            console.log(e);
        }
    }
}

export = command; // export the command to the main module
