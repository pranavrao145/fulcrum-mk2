import {Message, MessageEmbed} from 'discord.js';
import {ICommand} from '../../../utils/types';
import {Client} from 'pg';
import {timeout} from '../../../utils/helpers';

const command: ICommand = {
    name: 'setupvcroles',
    description: 'Sets up Fulcrum\'s voice channel role feature.',
    alias: ['svc'],
    syntax: 'f!setupvcroles',
    async execute(message: Message, _con: Client, _args?: string[]) {
        console.log(`Command setupvcroles started by user ${message.member!.user.tag} in guild ${message.guild!.name}.`); 

        const outputEmbed = new MessageEmbed() // create a new embed for output
        .setColor('#FFFCF4')
        .setTitle('Setup Voice Channel Roles - Report');

        let overallSuccess = true; // to keep track of whether or not the function was overall successful

        try {
            await message.channel.send('Setting up voice channel roles. This may take a moment...');
        } catch (e) {
            console.log(`There was an error sending a message in the guild ${message.guild}! The error message is below:`);
            console.log(e);
        }

        if (!message.member!.hasPermission('MANAGE_ROLES')) { // check for adequate permissions
            try {
                console.log('Insufficient permissions. Stopping execution.')
                return await message.reply('sorry, you need to have the `MANAGE_ROLES` permission to use this command.');
            } catch (e) {
                console.log(`There was an error sending a message in the guild ${message.guild}! The error message is below:`);
                console.log(e);
                return;
            }
        }

        const voiceChannelIDs = message.guild!.channels.cache.filter(c => c.type === 'voice').map(c => c.id); // get all the ids of the voice channels in the server

        for (const voiceChannelID of voiceChannelIDs) { // iterate through each of the voice channel IDs to create a voice channel role for each
            const voiceChannel = message.guild!.channels.cache.get(voiceChannelID); // get the actual channel

            if (!voiceChannel) { // check if the voice channel actually exists
                console.log(`Voice channel with ID ${voiceChannelID} does not exist. Skipping over it.`)
                continue;
            }
            
           
            const vcRole = message.guild!.roles.cache.find(r => r.name === voiceChannel.name); // attempt to find a role in the server with the same name as the channel

            if (vcRole) { // check if the role already exists
                console.log(`Voice channel role already exists for voice channel ${voiceChannel.name}. Skipping over it.`);
                continue;
            }

            try {
                await timeout(300);
                const vcRoleCreated = await message.guild!.roles.create({ // create the role with the same name as the voice channel
                    data: {
                        name: voiceChannel.name,
                    }
                });
                console.log(`Role ${vcRoleCreated.name} created successfully.`)
            } catch (e) {
                console.log(`Failed to create role ${voiceChannel.name}. The error message is below:`)
                console.log(e);
                overallSuccess = false; // the function has failed, so set overall success to false
            }
        }

        if (overallSuccess) { // check if the command was successful and add the according message
            console.log(`Voice channel roles set up successfully.`)
            outputEmbed.addField('Status', 'Success')
        } else {
            console.log(`Failed to set up some voice channel roles.`);
            outputEmbed.addField('Status', 'Failed - some voice channel roles may not have been fully set up')
        }

        try { // send output embed with information about the command's success
            if (outputEmbed.fields.length > 0) { // check if there are actually any fields to send the embed with
                outputEmbed.setDescription(`**Command executed by:** ${message.member!.user.tag}`);
                await message.channel.send(outputEmbed);
            }
            console.log(`Command setupvcroles, started by ${message.member!.user.tag}, terminated successfully in ${message.guild}.`);
        } catch (e) {
            console.log(`There was an error sending an embed in the guild ${message.guild}! The error message is below:`);
            console.log(e);
        }
    }

}

export = command; // export the command to the main module