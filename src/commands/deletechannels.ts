// TODO: Include functionality for the deleting voice channels based on roles

import {Message, MessageEmbed, TextChannel, VoiceChannel} from 'discord.js';
import {ICommand} from '../utils/types';
import {Client} from 'pg';
import {getChannelFromMention, timeout} from '../utils/helpers';

const command: ICommand = {
    name: 'deletechannels',
    description: 'Deletes all given channels.',
    alias: ['dc, dcs'],
    syntax: 'f!deletechannels [channel mentions (vc roles for voice channels)]',
    async execute(message: Message, con: Client, args?: string[]) {
        console.log(`Command deletechannels started by user ${message.member!.user.tag} in guild ${message.guild!.name}.`);

        let outputEmbed = new MessageEmbed() // create an embed to display the results of the command
            .setColor('#FFFCF4')
            .setTitle('Delete Channels - Report');

        let outputEmbedText: string = ''; // text that will eventually be sent as a field in outputEmbed. Mainly for formatting

        if (!message.member!.hasPermission('MANAGE_CHANNELS')) { // check for adequate permissions
            try {
                console.log('Insufficient permissions. Stopping execution.')
                return await message.reply('sorry, you need to have the MANAGE_CHANNELS permission to use this command.');
            } catch (e) {
                console.log(`There was an error sending a message in the guild ${message.guild}! The error message is below:`);
                console.log(e);
                return;
            }
        }

        if (!args || args.length === 0) { // check if the args exist (this function requires them) and that there are not too many args
            try {
                console.log('Incorrect syntax given. Stopping execution.');
                return await message.channel.send(`Incorrect syntax! Correct syntax: ${this.syntax}`)
            } catch (e) {
                console.log(`There was an error sending a message in the guild ${message.guild}! The error message is below:`);
                console.log(e);
                return;
            }
        }

        for (const channelMention of args) { // iterate through each of the mentions
            const channel = getChannelFromMention(message, channelMention); // get the channel according to the mention of the user

            if (!channel) { // check if the channel actually exists
                console.log(`A channel given was invalid. Skipping over it.`);
                outputEmbedText += `\n**${channelMention}:** Invalid channel or channel not found.`;
                continue;
            }


            try {
                await timeout(300); // setting a short timeout to prevent abuse of Discord's API
                await channel.delete(); // delete the channel
                console.log(`Channel ${(channel as TextChannel | VoiceChannel).name} of type ${channel.type} deleted successfully.`)
                outputEmbedText += `\n**${(channel as TextChannel | VoiceChannel).name}**: Channel deleted successfully.`;
            } catch (e) {
                console.log(`Failed to delete channel ${(channel as TextChannel | VoiceChannel).name}.`)
                outputEmbedText += `\n**${(channel as TextChannel | VoiceChannel).name}**: Couldn\'t delete channel.`;
            }
        }

        try { // send output embed with information about the command's success
            outputEmbed.addField('\u200B', outputEmbedText); // add whatever text was accumulated throughout the command to the embed
            if (outputEmbedText !== '') { // check if there is actually any text to send the embed with
                outputEmbed.setDescription(`**Command executed by:** ${message.member!.user.tag}`);
                await message.channel.send(outputEmbed);
            }
            console.log(`Command deletechannels, started by ${message.member!.user.tag}, terminated successfully in ${message.guild}.`);
        } catch (e) {
            console.log(`There was an error sending an embed in the guild ${message.guild}! The error message is below:`);
            console.log(e);
        }
    }
}

export = command; // export the command to the main module
