import { Message, MessageEmbed } from 'discord.js';
import { ICommand } from '../../../utils/types';
import { Client } from 'pg';

const command: ICommand = {
    name: 'unban',
    description: 'Unbans the given user. You can optionally specify a reason for unbanning.',
    alias: ['ub'],
    syntax: 'f!unban [user ID] (reason)',
    async execute(message: Message, _con: Client, args?: string[]) {
        console.log(`Command unban started by user ${message.member!.user.tag} in guild ${message.guild!.name}.`);

        let outputEmbed = new MessageEmbed() // create an embed to display the results of the command
            .setColor('#FFFCF4')
            .setTitle('Unban - Report')

        if (!message.member!.permissions.has('BAN_MEMBERS')) { // check for adequate permissions
            try {
                console.log('Insufficient permissions. Stopping execution.')
                return await message.reply('Sorry, you need to have the `BAN_MEMBERS` permission to use this command.');
            } catch (e) {
                console.log(`There was an error sending a message in the guild ${message.guild!.name}! The error message is below:`);
                console.log(e);
                return;
            }
        }

        if (!args || args.length === 0) { // check if the args exist (this function requires them) and that there are not too many args
            try {
                console.log('Incorrect syntax given. Stopping execution.');
                return await message.channel.send(`Incorrect syntax. correct syntax: \`${this.syntax}\``)
            } catch (e) {
                console.log(`There was an error sending a message in the guild ${message.guild!.name}! The error message is below:`);
                console.log(e);
                return;
            }
        }

        const userID = args!.shift(); // get the user ID
        const reasonToUnban = args!.join(' '); // get the potential reason to ban by joining the rest of the args

        let ban: any; // declaring ban object for use with logic below

        try {
            ban = await message.guild!.bans.fetch(userID!); // attempt to get the user's ban info
        } catch (e) {
            console.log('User ID supplied was invalid or couldn\'t find ban. Stopping execution.');
            try {
                return await message.channel.send('Invalid user ID or user not banned.');
            } catch (e) {
                console.log(`There was an error sending a message in the guild ${message.guild!.name}! The error message is below:`);
                console.log(e);
                return;
            }
        }


        if (reasonToUnban) { // check if the user has provided a reason to unban
            try {
                await message.guild!.members.unban(ban!.user, reasonToUnban);
                console.log(`Unbanned user ${ban!.user.tag}.`); // unban the user with the reason given
                outputEmbed.addField('Status', 'Success');
                outputEmbed.addField('Reason', `${reasonToUnban}`);
            } catch (e) {
                console.log(`Failed to unban user ${ban!.user.tag}.`)
                outputEmbed.addField('Status', 'Failed');
            }
        } else { // if there is no reason
            try {
                await message.guild!.members.unban(ban!.user);
                console.log(`Unbanned user ${ban!.user.tag}.`); // unban the user
                outputEmbed.addField('Status', 'Success');
            } catch (e) {
                console.log(`Failed to unban user ${ban!.user.tag}.`)
                outputEmbed.addField('Status', 'Failed');
            }
        }

        try { // send output embed with information about the command's success
            if (outputEmbed.fields.length > 0) { // check if there are actually any fields to send the embed with
                outputEmbed.setDescription(`**Command executed by:** ${message.member!.user.tag}\n**User unbanned:** ${ban!.user.tag}`);
                await message.channel.send({ embeds: [outputEmbed] });
            }
            console.log(`Command unban, started by ${message.member!.user.tag}, terminated successfully in ${message.guild!.name}.`);
        } catch (e) {
            console.log(`There was an error sending an embed in the guild ${message.guild!.name}! The error message is below:`);
            console.log(e);
        }
    }
}

export = command; // export the command to the main module
