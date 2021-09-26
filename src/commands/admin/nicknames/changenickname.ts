import { Message, MessageEmbed } from 'discord.js';
import { ICommand } from '../../../utils/types';
import { Client } from 'pg';
import { getUserFromMention } from '../../../utils/helpers';

const command: ICommand = {
    name: 'changenickname',
    description: 'Changes the nickname of the given user to the new nickname given.',
    alias: ['changenick', 'cn'],
    syntax: 'f!changenickname [user mention] [new nickname (underscores for spaces)]',
    async execute(message: Message, _con: Client, args?: string[]) {
        console.log(`Command lock started by user ${message.member!.user.tag} in guild ${message.guild!.name}.`);

        const outputEmbed = new MessageEmbed() // create a new embed for output
            .setColor('#FFFCF4')
            .setTitle('Change Nickname - Report');

        if (!message.member!.permissions.has('MANAGE_NICKNAMES')) { // check for adequate permissions
            try {
                console.log('Insufficient permissions. Stopping execution.')
                return await message.reply('Sorry, you need to have the `MANAGE_NICKNAMES` permission to use this command.');
            } catch (e) {
                console.log(`There was an error sending a message in the guild ${message.guild!.name}! The error message is below:`);
                console.log(e);
                return;
            }
        }

        if (!args || args.length !== 2) { // check if the args exist (this function requires them) and that there are not too many args
            try {
                console.log('Incorrect syntax given. Stopping execution.');
                return await message.channel.send(`Incorrect syntax. Correct syntax: \`${this.syntax}\``)
            } catch (e) {
                console.log(`There was an error sending a message in the guild ${message.guild!.name}! The error message is below:`);
                console.log(e);
                return;
            }
        }

        const userMention = args!.shift(); // find the mention of the user in the args
        const user = getUserFromMention(message, userMention!);

        if (!user) { // check if the user supplied was valid
            console.log('User supplied was invalid. Stopping execution.');
            try {
                return await message.channel.send('Invalid user.');
            } catch (e) {
                console.log(`There was an error sending a message in the guild ${message.guild!.name}! The error message is below:`);
                console.log(e);
                return;
            }
        }

        const newNick = args!.shift()!.replace(/_/g, ' '); // get the new name for the user and replace all underscores with spaces

        if (!newNick) {
            console.log('Nickname supplied was invalid. Stopping execution.');
            try {
                return await message.channel.send('Invalid nickname.');
            } catch (e) {
                console.log(`There was an error sending a message in the guild ${message.guild!.name}! The error message is below:`);
                console.log(e);
                return;
            }
        }

        try { // attempt to set the user's nickname to the new nickname given
            await user.setNickname(newNick);
            console.log(`Successfully changed ${user!.user.tag}'s nickname to ${user.nickname}.'`);
            outputEmbed.addField('Status', 'Success');
        } catch (e) {
            console.log(`Failed to change nickname of ${user!.user.tag}.`);
            outputEmbed.addField('Status', 'Failed');
        }

        try { // send output embed with information about the command's success
            if (outputEmbed.fields.length > 0) { // check if there are actually any fields to send the embed with
                outputEmbed.setDescription(`**Command executed by:** ${message.member!.user.tag}\n**Changed nickname of:** ${user!.user.tag}\n**Changed to:** ${user.nickname}`);
                await message.channel.send({ embeds: [outputEmbed] });
            }
            console.log(`Command changenickname, started by ${message.member!.user.tag}, terminated successfully in ${message.guild!.name}.`);
        } catch (e) {
            console.log(`There was an error sending an embed in the guild ${message.guild!.name}! The error message is below:`);
            console.log(e);
        }
    }
}

export = command; // export the command to the main module
