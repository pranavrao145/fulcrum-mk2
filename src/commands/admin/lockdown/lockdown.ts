import {Message, MessageEmbed} from 'discord.js';
import {ICommand} from '../../../utils/types';
import {Client} from 'pg';
import {getRoleFromMention, getUserFromMention, timeout} from '../../../utils/helpers';

const command: ICommand = {
    name: 'lockdown',
    description: 'Locks down the whole server, disabling people without special priveleges from sending messages and connecting to voice channels. Also optionally deletes any and all active invites to the server. WARNING: To be used in emergencies only (situations like extreme and unmanageable bot attacks).',
    syntax: 'f!lockdown [delete all invites?, true/false, default false]',
    async execute(message: Message, _con: Client, _args?: string[]) {
        console.log(`Command lockdown started by user ${message.member!.user.tag} in guild ${message.guild!.name}.`);

        let outputEmbed = new MessageEmbed() // create an embed to display the results of the command
            .setColor('#FFFCF4')
            .setTitle('Assign Roles - Report')

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
    }
}
