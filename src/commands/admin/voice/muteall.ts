import {Message, MessageEmbed} from 'discord.js';
import {ICommand} from '../../../utils/types';
import {Client} from 'pg';
import {getRoleFromMention, timeout} from '../../../utils/helpers';

const command: ICommand = {
    name: 'muteall',
    description: 'Mutes all the members of the specified voice channel.',
    alias: ['ma'],
    syntax: 'f!muteall [voice channel role mention]',
    async execute(message: Message, _con: Client, args?: string[]) {
        console.log(`Command muteall started by user ${message.member!.user.tag} in guild ${message.guild!.name}.`);
 
        const outputEmbed = new MessageEmbed() // create a new embed for output
        .setColor('#FFFCF4')
        .setTitle('Mute All - Report');

        let overallSuccess = true; // to keep track of whether or not the function was overall successful

        if (!message.member!.permissions.has('MUTE_MEMBERS')) { // check for adequate permissions
            try {
                console.log('Insufficient permissions. Stopping execution.')
                return await message.reply('sorry, you need to have the `MUTE_MEMBERS` permission to use this command.');
            } catch (e) {
                console.log(`There was an error sending a message in the guild ${message.guild!.name}! The error message is below:`);
                console.log(e);
                return;
            }
        }

        if (!args || args.length === 0) { // check if the args exist (this function requires them) and that there are not too many args
            try {
                console.log('Incorrect syntax given. Stopping execution.');
                return await message.channel.send(`Incorrect syntax. Correct syntax: \`${this.syntax}\``)
            } catch (e) {
                console.log(`There was an error sending a message in the guild ${message.guild!.name}! The error message is below:`);
                console.log(e);
                return;
            }
        }
 
        const roleMention = args!.shift(); // find the mention of the role numbers in the args
        const vcRole = getRoleFromMention(message, roleMention!); // get the actual voice channel role

        if (!vcRole) { // if the voice channel role does not exist
            console.log('Invalid voice channel role given. Stopping execution.');
            try {
                return await message.channel.send('Invalid role.');
            } catch (e) {
                console.log(`There was an error sending a message in the guild ${message.guild!.name}! The error message is below:`);
                console.log(e);
                return;
            }
        }

        const voiceChannel = message.guild!.channels.cache.filter(c => c.type === 'GUILD_VOICE').find(c => c.name === vcRole.name); // attempt to get voice channel with the same name

        if (!voiceChannel) {
            console.log('No voice channel found associated with the role supplied. Stopping execution.');
            try {
                return await message.channel.send('No voice channel found for that role!');
            } catch (e) {
                console.log(`There was an error sending a message in the guild ${message.guild!.name}! The error message is below:`);
                console.log(e);
                return;
            }
        }
        
        const vcMembers = voiceChannel.members.values(); // get all the members in the voice channel

        for (const member of vcMembers) { // iterate through each of the members to mute them
            if (!member) { // if the member doesn't exist
                console.log('A member in the voice channel did not exists. Skipping over them.');
                overallSuccess = false; // if a member for a role does not exists, the function has failed to mute all members in the channel
                continue;
            }

            try {
                await timeout(300); // setting a short timeout to prevent abuse of Discord's API
                await member.voice.setMute(true); // attempt to mute the member
                console.log(`Member ${member.user.tag} muted successfully in voice channel ${voiceChannel.name}`);
            } catch (e) {
                console.log(`Failed to mute member ${member.user.tag} in voice channel ${voiceChannel.name}`);
                overallSuccess = false; // function failed to mute all members
            }
        }
 
        if (overallSuccess) { // check if the function was successful and add the right output message
            outputEmbed.addField('Status', 'Success');
        } else {
            outputEmbed.addField('Status', 'Failed - some members may not have been muted');
        }
 
        try { // send output embed with information about the command's success
            if (outputEmbed.fields.length > 0) { // check if there are actually any fields to send the embed with
                outputEmbed.setDescription(`**Command executed by:** ${message.member!.user.tag}\n**Voice channel muted:** ${voiceChannel.name}`);
                await message.channel.send({ embeds: [outputEmbed] });
            }
            console.log(`Command muteall, started by ${message.member!.user.tag}, terminated successfully in ${message.guild!.name}.`);
        } catch (e) {
            console.log(`There was an error sending an embed in the guild ${message.guild!.name}! The error message is below:`);
            console.log(e);
        }
        
    }
}

export = command; // export the command to the main module
