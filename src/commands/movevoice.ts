import { Message, MessageEmbed } from 'discord.js';
import { ICommand } from '../utils/types';
import { Client } from 'pg';
import { getRoleFromMention, timeout } from '../utils/helpers';

const command: ICommand = {
    name: 'movevoice',
    description: 'Moves the members in the first given voice channel to the other.',
    alias: ['mv'],
    syntax: 'f!movevoice [vc role mention (from)] [vc role mention (to)]',
    async execute(message: Message, con: Client, args?: string[]) {
        console.log(`Command movevoice started by user ${message.member!.user.tag} in guild ${message.guild!.name}.`);

        let outputEmbed = new MessageEmbed() // create an embed to display the results of the command
        .setColor('#FFFCF4')
        .setTitle('Move Voice - Report');

        let overallSuccess = true; // to keep track of whether or not the function was overall successful

        if (!message.member!.hasPermission('MOVE_MEMBERS')) { // check for adequate permissions
            try {
                console.log('Insufficient permissions. Stopping execution.')
                return await message.reply('sorry, you need to have the MANAGE_ROLES permission to use this command.');
            } catch (e) {
                console.log(`There was an error sending a message in the guild ${message.guild}! The error message is below:`);
                console.log(e);
            }
        }

        if (!args || args.length !== 2) { // check if the args exist (this function requires them) and that there are not too many args
            try {
                console.log('Incorrect syntax given. Stopping execution.');
                return await message.channel.send(`Incorrect syntax! Correct syntax: ${this.syntax}`)
            } catch (e) {
                console.log(`There was an error sending a message in the guild ${message.guild}! The error message is below:`);
                console.log(e);
            }
        }

        const roleMentionFrom = args!.shift(); // get the vc role mention for the voice channel the user is moving from
        const roleMentionTo = args!.shift(); // get the vc role mention for the voice channel the user is moving to

        const roleFrom = getRoleFromMention(message, roleMentionFrom!); // actually get the role from
        const roleTo = getRoleFromMention(message, roleMentionTo!); // actually get the role to

    }
}
