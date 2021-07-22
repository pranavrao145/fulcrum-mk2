import {Message, MessageEmbed} from 'discord.js';
import {ICommand} from '../../../utils/types';
import {Client} from 'pg';
import {getChannelFromMention, getRoleFromMention, getUserFromMention, isValidColor} from '../../../utils/helpers';

const command: ICommand = {
    name: 'createrole',
    description: 'Creates a role with the given name and optionally the given colour.',
    alias: ['cr'],
    syntax: 'f!createrole [role name, underscores for spaces] (colour code)',
    async execute(message: Message, _con: Client, args?: string[]) {
        console.log(`Command createrole started by user ${message.member!.user.tag} in guild ${message.guild!.name}.`);

        let outputEmbed = new MessageEmbed() // create an embed to display the results of the command
            .setColor('#FFFCF4')
            .setTitle('Create Role - Report');


        if (!message.member!.hasPermission('MANAGE_ROLES')) { // check for adequate permissions
            try {
                console.log('Insufficient permissions. Stopping execution.')
                return await message.reply('sorry, you need to have the `MANAGE_ROLES` permission to use this command.');
            } catch (e) {
                console.log(`There was an error sending a message in the guild ${message.guild!.name}! The error message is below:`);
                console.log(e);
                return;
            }
        }

        if (!args || args.length === 0 || args.length > 2) { // check if the args exist (this function requires them) and that there are not too many args
            try {
                console.log('Incorrect syntax given. Stopping execution.');
                return await message.channel.send(`Incorrect syntax. Correct syntax: \`${this.syntax}\``)
            } catch (e) {
                console.log(`There was an error sending a message in the guild ${message.guild!.name}! The error message is below:`);
                console.log(e);
                return;
            }
        }

        let roleName = args!.shift(); // find the desired name of the role
        let roleColor = args!.shift(); // find the desired colour of the role

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
                console.log(`There was an error sending an embed in the guild ${message.guild!.name}! The error message is below:`);
                console.log(e);
                return;
            }
        }


        if (roleColor) { // in the case there is a role colour specified
            console.log('Role colour detected. Attempting to create role with colour.')

            if (!roleColor.startsWith('#')) {
                roleColor = '#' + roleColor
            }

            roleColor = roleColor!.toUpperCase();
            if (!isValidColor(roleColor!)) { // check if the color supplied was valid 
                console.log('Color supplied was invalid. Stopping execution.');
                try {
                    return await message.channel.send('Invalid color.');
                } catch (e) {
                    console.log(`There was an error sending a message in the guild ${message.guild!.name}! The error message is below:`);
                    console.log(e);
                    return;
                }
            }

            try {
                await message.guild!.roles.create({ // create the role with the needed data
                    data: {
                        name: roleName,
                        color: roleColor
                    }
                })

                outputEmbed.addField('Status', 'Success');
                outputEmbed.addField('Colour', `${roleColor}`);
                console.log(`Role ${roleName} created successfully in ${message.guild!.name}.`)
            }
            catch (e) {
                outputEmbed.addField('Status', 'Failed');
                console.log(`Failed to create role ${roleName} in server ${message.guild!.name}. The error message is below:`)
            }
        } else {
            try {
                console.log('No role colour detected. Attempting to create role without colour.')
                await message.guild!.roles.create({ // create the role with the needed data
                    data: {
                        name: roleName,
                    }
                })
                outputEmbed.addField(`Status`, 'Success');
                console.log(`Role ${roleName} created successfully in ${message.guild!.name}.`)
            }
            catch (e) {
                console.log(`Failed to create role ${roleName} in server ${message.guild!.name}. The error message is below:`)
                outputEmbed.addField(`${roleName}`, 'Couldn\'t create role.');
            }
        }

        try { // send output embed with information about the command's success
            if (outputEmbed.fields.length > 0) { // check if there are actually any fields to send the embed with
                outputEmbed.setDescription(`**Command executed by:** ${message.member!.user.tag}\n**Role created:** ${roleName}`);
                await message.channel.send(outputEmbed);
            }
            console.log(`Command createrole, started by ${message.member!.user.tag}, terminated successfully in ${message.guild!.name}.`);
        } catch (e) {
            console.log(`There was an error sending an embed in the guild ${message.guild!.name}! The error message is below:`);
            console.log(e);
        }
    }
}

export = command; // export the command to the main module
