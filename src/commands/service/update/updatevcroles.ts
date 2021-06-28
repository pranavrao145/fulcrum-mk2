import {Message, MessageEmbed} from 'discord.js';
import {ICommand} from '../../../utils/types';
import {Client} from 'pg';
import {timeout} from '../../../utils/helpers';

const command: ICommand = {
    name: 'updatevcroles',
    description: 'Adds the given role to the given user(s). Max 10 users mentionable with one command.',
    alias: ['uvcr', 'uvc', 'uvr', 'uv'],
    syntax: 'f!updatevcroles',
    async execute(message: Message, _con: Client, _args?: string[]) {
        console.log(`Command updatevcroles started by user ${message.member!.user.tag} in guild ${message.guild!.name}.`);

        let outputEmbed = new MessageEmbed() // create an embed to display the results of the command
            .setColor('#FFFCF4')
            .setTitle('Update Voice Channel Roles - Report');

        let overallSuccess = true;

        try {
            await message.channel.send('Updating voice channel roles. This may take a moment...');
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

        for (const voiceChannelID of voiceChannelIDs) { // iterate through each of the voice channels and add/remove role as neccessary
            const voiceChannel = message.guild!.channels.cache.get(voiceChannelID); // get the actual channel

            if (!voiceChannel) { // check if the voice channel actually exists
                console.log(`Voice channel with ID ${voiceChannelID} does not exist. Skipping over it.`)
                continue;
            }

            const vcRole = message.guild!.roles.cache.find(r => r.name === voiceChannel.name); // attempt to find a role in the server with the same name as the channel

            if (!vcRole) { // check if a voice channel role for the channel actually exists
                console.log(`No voice channel role found for channel ${voiceChannel.name}. Skipping over it.`);
                continue;
            }

            const vcMembers = voiceChannel.members.map(mem => mem.id); // get the members of the voice channel and map them to their ids

            // make sure all the people in the voice channel have the role
            for (const vcMemberID of vcMembers) {
                const vcMember = message.guild!.members.cache.get(vcMemberID); // get the actual voice channel member

                if (!vcMember) { // check if a member actually exists for the current id
                    console.log(`Invalid user for ID ${vcMemberID}. Skipping over them.`);
                    continue;
                }

                try {
                    if (!vcMember.roles.cache.find(r => r.id === vcRole.id)) { // check if the person doesn't already have the role
                        await timeout(300); // setting a short timeout to prevent abuse of Discord's API
                        await vcMember.roles.add(vcRole); // add the role to the member
                    }
                    console.log(`Voice channel role ${vcRole.name} added to user ${vcMember.user.tag} successfully.`);
                } catch (e) {
                    console.log(`Failed to add ${vcRole.name} to ${vcMember.user.tag}.`);
                    overallSuccess = false; // the function has failed to add the role to all members, so not successful
                }
            }


            const roleMembers = vcRole.members.map(mem => mem.id); // get all the members of this vc role

            // make sure people that are not in the voice channel do not have the associated role
            for (const roleMemberID of roleMembers) {
                const roleMember = message.guild!.members.cache.get(roleMemberID); // get the actual role member

                if (!roleMember) {
                    console.log(`Invalid user for ID ${roleMemberID}. Skipping over them.`);
                    continue;
                }

                try {
                    if (!roleMember.roles.cache.find(r => r.id === vcRole.id)) { // check if the person has the role
                        await timeout(300); // setting a short timeout to prevent abuse of Discord's API
                        await roleMember.roles.remove(vcRole); // remove the role from the member
                    }
                    console.log(`Voice channel role ${vcRole.name} removed from user ${roleMember.user.tag} successfully.`);
                } catch (e) {
                    console.log(`Failed to add ${vcRole.name} from ${roleMember.user.tag}.`);
                    overallSuccess = false; // the function has failed to remove the role from all members, so not successful
                }
            }
        }

        if (overallSuccess) {
            console.log('Successfully updated all voice channel roles.');
            outputEmbed.addField('Status', 'Success')
        } else {
            console.log('Failed to update some voice channel roles.')
            outputEmbed.addField('Status', 'Failed - some voice channel roles may not have been fully updated')
        }

        try { // send output embed with information about the command's success
            if (outputEmbed.fields.length > 0) { // check if there are actually any fields to send the embed with
                outputEmbed.setDescription(`**Command executed by:** ${message.member!.user.tag}`);
                await message.channel.send(outputEmbed);
            }
            console.log(`Command updatevcroles, started by ${message.member!.user.tag}, terminated successfully in ${message.guild}.`);
        } catch (e) {
            console.log(`There was an error sending an embed in the guild ${message.guild}! The error message is below:`);
            console.log(e);
        }
    }
}

export = command; // export the command to the main module