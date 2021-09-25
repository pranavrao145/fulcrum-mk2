import { Message, MessageEmbed } from 'discord.js';
import { ICommand } from '../../utils/types';
import { Client } from 'pg';

const command: ICommand = {
    name: 'supportserver',
    description: 'Gives the user an invite to the Fulcrum support server.',
    alias: ['ss'],
    syntax: 'f!supportserver',
    async execute(message: Message, _con: Client, _args?: string[]) {
        console.log(`Command supportserver started by user ${message.member!.user.tag} in guild ${message.guild!.name}.`);

        let outputEmbed = new MessageEmbed() // create an embed to display the results of the command
            .setColor('#FFFCF4')
            .setTitle('Support Server Invite')

        outputEmbed.addField('Link to Join Support Server', '[Click here](https://discord.gg/Yh4mkr88Hc)')

        try { // send output embed with information about the command's success
            if (outputEmbed.fields.length > 0) { // check if there are actually any fields to send the embed with
                outputEmbed.setDescription(`**Command executed by:** ${message.member!.user.tag}`);
                await message.channel.send({ embeds: [outputEmbed] });
            }
            console.log(`Command supportserver, started by ${message.member!.user.tag}, terminated successfully in ${message.guild!.name}.`);
        } catch (e) {
            console.log(`There was an error sending an embed in the guild ${message.guild!.name}! The error message is below:`);
            console.log(e);
        }
    }
}

export = command; // export the command to the main module
