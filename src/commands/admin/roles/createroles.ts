import {ICommand} from '../../../utils/types';
import {Message, MessageEmbed} from 'discord.js';
import {Client} from 'pg';
import {getChannelFromMention, getRoleFromMention, getUserFromMention} from '../../../utils/helpers';

const command: ICommand = {
    name: 'createroles',
    description: 'Creates role(s) with the given name(s). You can create upto 10 roles with one command.',
    alias: ['crs'],
    syntax: 'f!createroles [role names (10 max, underscores for spaces)]',
    async execute(message: Message, _con: Client, args?: string[]) {
        console.log(`Command createroles started by user ${message.member!.user.tag} in guild ${message.guild!.name}.`);

        let outputEmbed = new MessageEmbed() // create an embed to display the results of the command
            .setColor('#FFFCF4')
            .setTitle('Create Roles - Report')

        let outputEmbedText: string = ''; // text that will eventually be sent as a field in outputEmbed. Mainly for formatting

        if (!message.member!.permissions.has('MANAGE_ROLES')) { // check for adequate permissions
            try {
                console.log('Insufficient permissions. Stopping execution.')
                return await message.reply('sorry, you need to have the `MANAGE_ROLES` permission to use this command.');
            } catch (e) {
                console.log(`There was an error sending a message in the guild ${message.guild!.name}! The error message is below:`);
                console.log(e);
                return;
            }
        }

        if (!args || args.length === 0 || args.length < 1 || args.length > 10) { // check if the args exist (this function requires them) and that there are not too many args
            try {
                console.log('Incorrect syntax given. Stopping execution.');
                return await message.channel.send(`Incorrect syntax. Correct syntax: \`${this.syntax}\``)
            } catch (e) {
                console.log(`There was an error sending a message in the guild ${message.guild!.name}! The error message is below:`);
                console.log(e);
                return;
            }
        }

        for (let roleName of args!) { // iterate through each of the role names given
            roleName = roleName!.replace(/_/g, ' '); // replce all underscores with spaces

            if (roleName!.startsWith('@')) { // check if the role starts with an @ and get rid of it if so
                roleName = roleName!.slice(1);
            }

            if (getRoleFromMention(message, roleName!) || message.guild!.roles.cache.find(r => r.name === roleName) || getChannelFromMention(message, roleName!) || getUserFromMention(message, roleName!)) {
                console.log(`Role with name ${roleName} already exists in guild. Skipping over it.`);
                outputEmbedText += `\n**${roleName}:** Invalid role or role already exists on server.`;
                continue;
            }

            try {
                await message.guild!.roles.create({ // create the role with the needed data
                    data: {
                        name: roleName,
                    }
                });
                outputEmbedText += `\n**${roleName}:** Role created successfully.`;
                console.log(`Role ${roleName} created successfully in ${message.guild!.name}.`)
            } catch (e) {
                console.log(`Failed to create role ${roleName} in server ${message.guild!.name}. The error message is below:`)
                console.log(e);
                outputEmbedText += `\n**${roleName}:** Couldn't create role.`;
            }
        }

        try { // send output embed with information about the command's success
            outputEmbed.addField('\u200B', outputEmbedText); // add whatever text was accumulated throughout the command to the embed
            if (outputEmbedText !== '') { // check if there is actually any text to send the embed with
                outputEmbed.setDescription(`**Command executed by:** ${message.member!.user.tag}`);
                await message.channel.send(outputEmbed);
            }
            console.log(`Command createroles, started by ${message.member!.user.tag}, terminated successfully in ${message.guild!.name}.`);
        } catch (e) {
            console.log(`There was an error sending an embed in the guild ${message.guild!.name}! The error message is below:`);
            console.log(e);
        }
    }
}

export = command; // export the command to the main module
