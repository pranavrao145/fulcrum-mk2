import {Message, MessageEmbed, TextChannel, VoiceChannel} from 'discord.js';
import {ICommand} from '../../../utils/types';
import {Client} from 'pg';
import {getChannelFromMention, getRoleFromMention} from '../../../utils/helpers';

const command: ICommand = {
    name: 'renamechannel',
    description: 'Renames the given channel to the new name given.',
    alias: ['rc'],
    syntax: 'f!renamechannel [channel mention (voice channel role for voice channel)] [new name (underscores for spaces)]',
    async execute(message: Message, _con: Client, args?: string[]) {
        console.log(`Command renamechannel started by user ${message.member!.user.tag} in guild ${message.guild!.name}.`);

        const outputEmbed = new MessageEmbed() // create a new embed for output
            .setColor('#FFFCF4')
            .setTitle('Rename Channel - Report');

        if (!message.member!.permissions.has('MANAGE_CHANNELS')) { // check for adequate permissions
            try {
                console.log('Insufficient permissions. Stopping execution.')
                return await message.reply('sorry, you need to have the `MANAGE_CHANNELS` permission to use this command.');
            } catch (e) {
                console.log(`There was an error sending a message in the guild ${message.guild!.name}! The error message is below:`);
                console.log(e);
                return;
            }
        }


        if (!args || args.length < 2) { // check if the args exist (this function requires them) and that there are not too many args
            try {
                console.log('Incorrect syntax given. Stopping execution.');
                return await message.channel.send(`Incorrect syntax. Correct syntax: \`${this.syntax}\``)
            } catch (e) {
                console.log(`There was an error sending a message in the guild ${message.guild!.name}! The error message is below:`);
                console.log(e);
                return;
            }
        }

        const channelMention = args.shift(); // get the channel mention
        const newName = args.shift()!.replace(/_/g, ' '); // get the new name for the channel and replace all underscores with spaces

        const textChannel = getChannelFromMention(message, channelMention!); // attempt to get a text channel from the mention
        const vcRole = getRoleFromMention(message, channelMention!);

        if (textChannel) { // if a text channel is detected
            try { // attempt to rename the text channel right away
                const oldName = (textChannel as TextChannel).name; // take note of the old name of the channel (for output purposes)
                const newChannel: TextChannel = await (textChannel as TextChannel).setName(newName); // delete the channel
                console.log(`Channel ${oldName} renamed successfully to ${newName}.`);
                outputEmbed.setDescription(`**Command executed by:** ${message.member!.user.tag}\n**Channel renamed:** ${oldName}`);
                outputEmbed.addField('Status', 'Success');
                outputEmbed.addField('New Name', `${newChannel.name}`);
            } catch (e) {
                console.log(`Failed to rename channel ${(textChannel as TextChannel).name}.`)
                outputEmbed.addField('Status', 'Failed');
            }
        } else if (vcRole) { // else if a role is given, check if it is associated with a voice channel
            const voiceChannel = message.guild!.channels.cache.filter(c => c.type === 'GUILD_VOICE').find(c => c.name === vcRole.name); // attempt to get the voice channel associated with the role

            if (!voiceChannel) { // if the channel associated with the role does not exist
                console.log('No voice channel found associated with the role supplied. Stopping execution.');
                try {
                    return await message.channel.send('No voice channel found for that role!');
                } catch (e) {
                    console.log(`There was an error sending a message in the guild ${message.guild!.name}! The error message is below:`);
                    console.log(e);
                    return;
                }
            }

            try { // attempt to rename the voice channel 
                const oldName = (voiceChannel as VoiceChannel).name; // take note of the old name of the channel (for output purposes)
                const newChannel: VoiceChannel = await (voiceChannel as VoiceChannel).setName(newName); // rename the channel
                console.log(`Channel ${oldName} renamed successfully to ${newName}.`);
                outputEmbed.setDescription(`**Command executed by:** ${message.member!.user.tag}\n**Channel renamed:** ${oldName}`);
                outputEmbed.addField('Status', 'Success');
                outputEmbed.addField('New Name', `${newChannel.name}`);
            } catch (e) {
                console.log(`Failed to rename channel ${(voiceChannel as VoiceChannel).name}.`)
                outputEmbed.addField('Status', 'Failed');
            }

        } else { // if the argument supplied is neither a channel nor a role
            console.log(`Argument given was invalid for a text channel mention or a voice channel role. Stopping execution.`)
            try {
                return await message.channel.send('Invalid argument for channel or voice channel role.');
            } catch (e) {
                console.log(`There was an error sending a message in the guild ${message.guild!.name}! The error message is below:`);
                console.log(e);
                return;
            }
        }

        try { // send output embed with information about the command's success
            if (outputEmbed.fields.length > 0) { // check if there are actually any fields to send the embed with
                await message.channel.send(outputEmbed);
            }
            console.log(`Command define, started by ${message.member!.user.tag}, terminated successfully in ${message.guild!.name}.`);
        } catch (e) {
            console.log(`There was an error sending an embed in the guild ${message.guild!.name}! The error message is below:`);
            console.log(e);
        }

    }
}

export = command; // export the command to the main module
