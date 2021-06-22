import {Message, MessageEmbed} from 'discord.js';
import {ICommand} from '../../utils/types';
import {Client} from 'pg';

const command: ICommand = {
    name: 'updatemembercount',
    description: 'Updates the member count channel the current guild.',
    alias: ['umc'],
    syntax: 'f!updatemembercount',
    async execute(message: Message, con: Client, _args?: string[]) {
        console.log(`Command updatemembercount started by user ${message.member!.user.tag} in guild ${message.guild!.name}.`);

        let outputEmbed = new MessageEmbed() // create an embed to display the results of the command
            .setColor('#FFFCF4')
            .setTitle('Update Member Count - Report')

        if (!message.member!.hasPermission('MANAGE_CHANNELS')) { // check for adequate permissions
            try {
                console.log('Insufficient permissions. Stopping execution.')
                return await message.reply('sorry, you need to have the `MANAGE_CHANNELS` permission to use this command.');
            } catch (e) {
                console.log(`There was an error sending a message in the guild ${message.guild}! The error message is below:`);
                console.log(e);
                return;
            }
        }

        try {
            console.log(`Querying database to find member count channel for guild ${message.guild!.name}`);
            const res = await con.query(`SELECT * FROM membercountchannel WHERE guildid = '${message.guild!.id}'`); // find the id of the member count channel for the guild of the message

            const row = res.rows[0]; // get the first row from the database query result
            let voiceChannel; // declare voice channel that may be initialized later if there is a match

            if (!row) { // in the event a row does not exist
                try {
                    console.log(`Member count channel ID for guild does not exist in database.`);
                    return await message.channel.send('Member count channel not set up for this server! Run f!setup membercount.');
                } catch (e) {
                    console.log(`There was an error sending a message in the guild ${message.guild}! The error message is below:`);
                    console.log(e);
                    return;
                }
            }

            voiceChannel = message.guild!.channels.cache.get(row.channelid); // get the voice channel in the guild according to the id found

            if (!voiceChannel) { // in the event the voice channel does not exist
                try {
                    console.log(`No voice channel found for the channel ID ${row.channelid} in the database.`);
                    return await message.channel.send('Member count channel not set up for this server! Run f!setup membercount.');
                } catch (e) {
                    console.log(`There was an error sending a message in the guild ${message.guild}! The error message is below:`);
                    console.log(e);
                    return;
                }
            }

            const memberCount = message.guild!.channels.cache.size; // get the number of channels in the guild
            const nameToBeSet = `👥|Member Count: ${memberCount}` // what the member count channel should display

            if (voiceChannel.name === nameToBeSet) { // if the voice channel name is already correct, no need to change it
                try {
                    console.log(`Member count channel for this guild is already updated.`);
                    return await message.channel.send('Member count is already updated on this server!');
                } catch (e) {
                    console.log(`There was an error sending a message in the guild ${message.guild}! The error message is below:`);
                    console.log(e);
                    return;
                }
            }

            try {
                await voiceChannel.setName(nameToBeSet, 'Updated member count channel.'); // attempt to set the voice channel name to the right member count
                console.log('Member count channel updated successfully.');
                outputEmbed.addField('Status', 'Success');
            } catch (e) {
                console.log('Failed to upadate member count channel. The error message is below:');
                console.log(e);
                outputEmbed.addField('Status', 'Failed');
            }
        } catch (e) {
            console.log('There was an error retrieving for the guild from the database. The error message is below:');
            console.log(e);
            outputEmbed.addField('Status', 'Failed');
        }

        try { // send output embed with information about the command's success
            if (outputEmbed.fields.length > 0) { // check if there are actually any fields to send the embed with
                outputEmbed.setDescription(`**Command executed by:** ${message.member!.user.tag}`);
                await message.channel.send(outputEmbed);
            }
            console.log(`Command updatemembercount, started by ${message.member!.user.tag}, terminated successfully in ${message.guild}.`);
        } catch (e) {
            console.log(`There was an error sending an embed in the guild ${message.guild}! The error message is below:`);
            console.log(e);
        }
    }
}

export = command; // export the command to the main module