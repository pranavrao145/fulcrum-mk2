import { Message, MessageEmbed } from 'discord.js';
import { ICommand } from '../utils/types';
import { Client } from 'pg';
import { getRoleFromMention, getUserFromMention, timeout } from '../utils/helpers';

const command: ICommand = {
    name: 'assignuser',
    description: 'Assigns all the given roles to the given user',
    alias: ['au'],
    syntax: 'f!assignuser [user mention] [role mentions or numbers (10 max)]',
    async execute(message: Message, con: Client, args?: string[]) {
        console.log(`Command assignuser started by user ${message.member!.user.tag} in guild ${message.guild!.name}.`);

        let outputEmbed = new MessageEmbed() // create an embed to display the results of the command
        .setColor('#FFFCF4')
        .setTitle('Assign User - Report')

        let outputEmbedText: string = ''; // text that will eventually be sent as a field in outputEmbed. Mainly for formatting

        if (!message.member!.hasPermission('MANAGE_ROLES')) { // check for adequate permissions
            try {
                console.log('Insufficient permissions. Stopping execution.')
                return await message.reply('sorry, you need to have the MANAGE_ROLES permission to use this command.');
            } catch (e) {
                console.log(`There was an error sending a message in the guild ${message.guild}! The error message is below:`);
                console.log(e);
            }
        }

        if (!args || args.length === 0 || args.length < 2 || args.length > 11) { // check if the args exist (this function requires them) and that there are not too many args
            console.log('Checking validity of arguments...')
            try {
                console.log('Incorrect syntax given. Stopping execution.');
                return await message.channel.send(`Incorrect syntax! Correct syntax: ${this.syntax}`)
            } catch (e) {
                console.log(`There was an error sending a message in the guild ${message.guild}! The error message is below:`);
                console.log(e);
            }
        }

        const userMention = args!.shift(); // find the mention of the user in the args
        const user = getUserFromMention(message, userMention!);


        if (!user) { // check if the user supplied was valid
            console.log('User supplied was invalid. Stopping execution.');
            try {
                await message.channel.send('Invalid user!');
                return;
            } catch (e) {
                console.log(`There was an error sending a message in the guild ${message.guild}! The error message is below:`);
                console.log(e);
            }
        }


        for (const mention of args!) { // iterate through all the role mentions
            let role; // declare role object, to be determined later using logic below

            if (isNaN(parseInt(mention))) { // if the arg is a mention and not a number
                console.log('Role is of type mention. Getting role from role cache.')
                role = getRoleFromMention(message, mention); // then get it from the role cache
            } else {
                console.log('Role is of type number. Getting role using position.')
                role = message.guild!.roles.cache.get(message.guild!.roles.cache.map(r => r.id)[parseInt(mention) - 1]); // else find the role by its position number
            }

            if (!role) { // check if the role actually exists
                console.log('A role supplied was not valid. Skipping over it.');
                outputEmbedText += `\n**${mention}:** Invalid role or role not found`;
                continue;
            }

            try {
                await timeout(300); // setting a short timeout to prevent abuse of Discord's API
                await user!.roles.add(role); // adding role to the user
                console.log(`Role ${role.name} added to ${user!.user.tag} successfully.`)
                outputEmbedText += `\n**${role.name}**: Role added successfully.`;
            } catch (e) {
                console.log(`Failed to add role ${role.name} to ${user!.user.tag}.`)
                outputEmbedText += `\n**${role.name}**: Couldn\'t add role.`;
            }

        }

        try { // send output embed with information about the command's success
            outputEmbed.addField('\u200B', outputEmbedText); // add whatever text was accumulated throughout the command to the embed
            if (outputEmbedText !== '') { // check if there is actually any text to send the embed with
                outputEmbed.setDescription(`**Command executed by:** ${message.member!.user.tag}\n**Assigned roles to:** ${user!.user.tag}`);
                await message.channel.send(outputEmbed);
            }
            console.log(`Command assignuser, started by ${message.member!.user.tag}, terminated successfully in ${message.guild}.`);
        } catch (e) {
            console.log(`There was an error sending an embed in the guild ${message.guild}! The error message is below:`);
            console.log(e);
        }
    }
}

export = command; // export the command to the main module
