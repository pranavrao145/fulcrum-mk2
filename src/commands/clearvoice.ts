import { Message, MessageEmbed } from 'discord.js';
import { ICommand } from '../utils/types';
import { Client } from 'pg';
import { getRoleFromMention, timeout } from '../utils/helpers';

const command: ICommand = {
    name: 'clearvoice',
    description: 'Clears the given voice channel.',
    alias: ['cv'],
    syntax: 'f!clearvoice [vc role mention]',
    async execute(message: Message, con: Client, args?: string[]) {
        console.log(`Command clearvoice started by user ${message.member!.user.tag} in guild ${message.guild!.name}.`);

        let outputEmbed = new MessageEmbed() // create an embed to display the results of the command
        .setColor('#FFFCF4')
        .setTitle('Clear Voice - Report');

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

        if (!args || args.length === 0) { // check if the args exist (this function requires them) and that there are not too many args
            try {
                console.log('Incorrect syntax given. Stopping execution.');
                return await message.channel.send(`Incorrect syntax! Correct syntax: ${this.syntax}`)
            } catch (e) {
                console.log(`There was an error sending a message in the guild ${message.guild}! The error message is below:`);
                console.log(e);
            }
        }

        const roleMention = args!.shift(); // get the role mention
        const role = getRoleFromMention(message, roleMention!);

        if (!role) { // check if the role supplied was valid 
            console.log('Role supplied was invalid. Stopping execution.');
            try {
                await message.channel.send('Invalid role!');
            } catch (e) {
                console.log(`There was an error sending a message in the guild ${message.guild}! The error message is below:`);
                console.log(e);
            }
        }

        const voiceChannel = message.guild!.channels.cache.filter(c => c.type === 'voice').find(c => c.name === role!.name); // get the voice channel associated with the role

        if (!voiceChannel) { // check if there is actually a voice channel associated with the role supplied
            console.log('No voice channel found associated with the role supplied. Stopping execution.');
            try {
                await message.channel.send('No voice channel found for that role!');
            } catch (e) {
                console.log(`There was an error sending a message in the guild ${message.guild}! The error message is below:`);
                console.log(e);
            }
        }

        const vcMembers = voiceChannel!.members.map(m => m.id); // get the members currently in the voice channel

        for (const member of vcMembers) { // iterate through each member currently in the voice channel
            const guildMember = message.guild!.members.cache.get(member) // get the guild member object from the id

            if (!guildMember) { // check if the guild member actually exists
                console.log(`A user in the voice channel was invalid. Skipping over them.`);
                overallSuccess = false; // the function has failed, so set overall success to false
                continue;
            }

            try {
                await timeout(300);
                await guildMember.voice.setChannel(null);
                console.log(`Removed ${guildMember.user.tag} from channel ${voiceChannel!.name}.`)
            } catch (e) {
                console.log(`Error removing ${guildMember.user.tag} from voice channel ${voiceChannel!.name}.`);
                overallSuccess = false; // the function has failed, so set overall success to false
            }

        }
        
        try { // send output embed with information about the command's success
            if (overallSuccess) { // check if the function was successful and add the right output message
                outputEmbed.addField('Status', 'Success');
            } else {
                outputEmbed.addField('Status', 'Failed - some members may not have been removed');
            }

            outputEmbed.setDescription(`**Command executed by:** ${message.member!.user.tag}\n**Voice channel cleared:** ${voiceChannel!.name}`);
            await message.channel.send(outputEmbed);
            console.log(`Command clearvoice, started by ${message.member!.user.tag}, terminated successfully in ${message.guild}.`);
        } catch (e) {
            console.log(`There was an error sending an embed in the guild ${message.guild}! The error message is below:`);
            console.log(e);
        }

    }
}

export = command; // export the command to the main module
