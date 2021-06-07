import { Message, MessageEmbed } from 'discord.js';
import { ICommand } from '../utils/types';
import { Client } from 'pg';
import { getUserFromMention } from '../utils/helpers';

const command: ICommand = {
    name: 'ban',
    description: 'Bans the given user from the server.',
    syntax: 'f!ban [user mention] (days 0-7, 0 default) (reason)',
    async execute(message: Message, con: Client, args?: string[]) {
        console.log(`Command ban started by user ${message.member!.user.tag} in guild ${message.guild!.name}.`);

        let outputEmbed = new MessageEmbed() // create an embed to display the results of the command
        .setColor('#FFFCF4')
        .setTitle('Ban - Report')
    }
}
