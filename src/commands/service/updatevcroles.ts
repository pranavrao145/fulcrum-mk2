import {Message, MessageEmbed} from 'discord.js';
import {ICommand} from '../../utils/types';
import {Client} from 'pg';
import {getRoleFromMention, getUserFromMention, timeout} from '../../utils/helpers';

const command: ICommand = {
    name: 'updatevcroles',
    description: 'Adds the given role to the given user(s). Max 10 users mentionable with one command.',
    alias: ['uvcr', 'uvc', 'uvr', 'uv'],
    syntax: 'f!updatevcroles',
    admin: true,
    async execute(message: Message, _con: Client, args?: string[]) {
        console.log(`Command updatevcroles started by user ${message.member!.user.tag} in guild ${message.guild!.name}.`);

        let outputEmbed = new MessageEmbed() // create an embed to display the results of the command
            .setColor('#FFFCF4')
            .setTitle('Update Voice Channel Roles - Report');

            try {
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

        const voiceChannelNames = message.guild!.channels.cache.filter(c => c.type === 'voice').map(c => c.id); // get all the names of the voice channels in the server

        for (const voiceChannelID of voiceChannelNames) { // iterate through each of the voice channels
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

            const vcMembers = voiceChannel.members;

            for (const vcMember in vcMembers) {
                try {
                    await timeout(300); // setting a short timeout to prevent abuse of Discord's API
                }
            }
        }
    }
}
