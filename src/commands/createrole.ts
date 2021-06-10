import { Message, MessageEmbed } from 'discord.js';
import { ICommand } from '../utils/types';
import { Client } from 'pg';
import { getChannelFromMention, getRoleFromMention, getUserFromMention } from '../utils/helpers';

const command: ICommand = {
    name: 'createrole',
    description: 'Creates a role with the given name and colour.',
    alias: ['cr'],
    syntax: 'f!createrole [role name] (colour code)',
    async execute(message: Message, con: Client, args?: string[]) { 
        console.log(`Command createrole started by user ${message.member!.user.tag} in guild ${message.guild!.name}.`);

        let outputEmbed = new MessageEmbed() // create an embed to display the results of the command
        .setColor('#FFFCF4')
        .setTitle('Create Role - Report');


        if (!message.member!.hasPermission('MANAGE_ROLES')) { // check for adequate permissions
            try {
                console.log('Insufficient permissions. Stopping execution.')
                return await message.reply('sorry, you need to have the MANAGE_ROLES permission to use this command.');
            } catch (e) {
                console.log(`There was an error sending a message in the guild ${message.guild}! The error message is below:`);
                console.log(e);
                return;
            }
        }

        if (!args || args.length === 0 || args.length > 2 ) { // check if the args exist (this function requires them) and that there are not too many args
            try {
                console.log('Incorrect syntax given. Stopping execution.');
                return await message.channel.send(`Incorrect syntax! Correct syntax: ${this.syntax}`)
            } catch (e) {
                console.log(`There was an error sending a message in the guild ${message.guild}! The error message is below:`);
                console.log(e);
                return;
            }
        }

        let roleName = args!.shift(); // find the desired name of the role
        const roleColour = args!.shift(); // find the desired colour of the role

        if (roleName!.startsWith('@')) { // check if the role starts with an @ and get rid of it if so
            roleName = roleName!.slice(1);
        }

        roleName = roleName!.replace(/_/g, ' '); // replce all underscores with spaces

        if (getRoleFromMention(message, roleName!) || message.guild!.roles.cache.find(r => r.name === roleName) || getChannelFromMention(message, roleName!) || getUserFromMention(message, roleName!)) { // checking to see if the role already exists on the server as a role or anything else
            console.log('Invalid role name or role already exists in server. Stopping execution.');
            outputEmbed.addField(`${roleName}`, 'Invalid role name or role already exists on this server.');
            outputEmbed.setDescription(`**Command executed by:** ${message.member!.user.tag}`);
            try { // send output embed with information about the command's success
                return await message.channel.send(outputEmbed);
            } catch (e) {
                console.log(`There was an error sending an embed in the guild ${message.guild}! The error message is below:`);
                console.log(e);
                return;
            }
        }


        if (roleColour) { // in the case there is a role colour specified
            try {
                await message.guild!.roles.create({ // create the role with the needed data
                    data: {
                        name: roleName,
                        color: roleColour
                    }
                })
                outputEmbed.addField(`${roleName}`, 'Role created successfully.');
                console.log(`Role ${roleName} created successfully in ${message.guild!.name}.`)
            }
            catch (e) {
                outputEmbed.addField(`${roleName}`, 'Couldn\'t create role.');
                console.log(`Failed to create role ${roleName} in server ${message.guild!.name}. The error message is below:`)
                console.log(e);
            }
        } else {
            try {
                await message.guild!.roles.create({ // create the role with the needed data
                    data: {
                        name: roleName,
                    }
                })
                outputEmbed.addField(`${roleName}`, 'Role created successfully.');
                console.log(`Role ${roleName} created successfully in ${message.guild!.name}.`)
            }
            catch (e) {
                console.log(`Failed to create role ${roleName} in server ${message.guild!.name}. The error message is below:`)
                console.log(e);
                outputEmbed.addField(`${roleName}`, 'Couldn\'t create role.');
            }
        }

        try { // send output embed with information about the command's success
            if (outputEmbed.fields.length > 0) { // check if there are actually any fields to send the embed with
                outputEmbed.setDescription(`**Command executed by:** ${message.member!.user.tag}`);
                await message.channel.send(outputEmbed);
            }
            console.log(`Command createrole, started by ${message.member!.user.tag}, terminated successfully in ${message.guild}.`);
        } catch (e) {
            console.log(`There was an error sending an embed in the guild ${message.guild}! The error message is below:`);
            console.log(e);
        }
    }
}

export = command; // export the command to the main module
