import {Message, MessageEmbed, TextChannel, VoiceChannel} from 'discord.js';
import {ICommand} from '../../../utils/types';
import {Client} from 'pg';
import {timeout} from '../../../utils/helpers';

const command: ICommand = {
    name: 'unlockdown',
    description: 'Releases server from lockdown triggered by f!lockdown. **WARNING:** this gives the @everyone role CONNECT and SEND_MESSAGES permissions for all channels (like it is by default), so make sure any other roles required to restrict permissions are assigned and set with the correct permissions.',
    syntax: 'f!unlockdown',
    async execute(message: Message, _con: Client, args?: string[]) {
        console.log(`Command unlockdown started by user ${message.member!.user.tag} in guild ${message.guild!.name}.`);

        let outputEmbed = new MessageEmbed() // create an embed to display the results of the command
            .setColor('#FFFCF4')
            .setTitle('Unlockdown - Report')

        try {
            await message.channel.send('Lifting lockdown on server. This may take a moment...');
        } catch (e) {
            console.log(`There was an error sending a message in the guild ${message.guild}! The error message is below:`);
            console.log(e);
        }

        if (!message.member!.hasPermission('ADMINISTRATOR')) { // check for adequate permissions
            try {
                console.log('Insufficient permissions. Stopping execution.')
                return await message.reply('sorry, you need to have the `ADMINISTRATOR` permission to use this command.');
            } catch (e) {
                console.log(`There was an error sending a message in the guild ${message.guild}! The error message is below:`);
                console.log(e);
                return;
            }
        }

        const textChannels = message.guild!.channels.cache.filter(c => c.type === 'text').values(); // get all text channels in guild
        const voiceChannels = message.guild!.channels.cache.filter(c => c.type === 'voice').values(); // get all voice channels in guild

        let overallUnlockingSuccess = true; // variable to hold whether or not all channels were unlocked successfully

        for (const textChannel of textChannels) { // iterate through each of the text channels in the guild
            try {
                await timeout(300); // setting a short timeout to prevent abuse of Discord's API
                await (textChannel as TextChannel).updateOverwrite((textChannel as TextChannel).guild.roles.everyone, { SEND_MESSAGES: true }); // set the channel as read only for everyone
                console.log(`Successfully unlocked ${(textChannel as TextChannel).name}.`);
            } catch (e) {
                console.log(`Failed to unlock ${(textChannel as TextChannel).name}.`); 
                overallUnlockingSuccess = false;
            }
        }

        for (const voiceChannel of voiceChannels) { // iterate through each of the voice channels in the guild
            try {
                await timeout(300); // setting a short timeout to prevent abuse of Discord's API
                await (voiceChannel as VoiceChannel).updateOverwrite((voiceChannel as VoiceChannel).guild.roles.everyone, { CONNECT: true }); // get rid of the ability to connect to voice channels for everyone role
                console.log(`Successfully unlocked ${(voiceChannel as VoiceChannel).name}.`);
            } catch (e) {
                console.log(`Failed to unlock ${(voiceChannel as VoiceChannel).name}.`); 
                overallUnlockingSuccess = false;
            }
        }


        if (overallUnlockingSuccess) { // check if the locking was successful and add the right output message
            outputEmbed.addField('Status', 'Success');
        } else {
            outputEmbed.addField('Status', 'Failed - some channels may not have been fully unlocked');
        }

        try { // send output embed with information about the command's success
            if (outputEmbed.fields.length > 0) { // check if there are actually any fields to send the embed with
                outputEmbed.setDescription(`**Command executed by:** ${message.member!.user.tag}`);
                await message.channel.send(outputEmbed);
            }
            console.log(`Command unlockdown, started by ${message.member!.user.tag}, terminated successfully in ${message.guild}.`);
        } catch (e) {
            console.log(`There was an error sending an embed in the guild ${message.guild}! The error message is below:`);
            console.log(e);
        }
    }
}

export = command; // export the command to the main module
