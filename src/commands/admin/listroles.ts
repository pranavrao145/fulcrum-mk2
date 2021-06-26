import { ICommand } from '../../utils/types';
import { Message, MessageEmbed } from 'discord.js';
import { Client } from 'pg';

const command: ICommand = {
    name: 'listroles',
    description: 'Displays all the roles in the server in a list with numbers. For use with other role management commands.',
    alias: ['lr'],
    syntax: 'f!listroles',
    async execute(message: Message, _con: Client, _args?: string[]) {
        console.log(`Command listroles started by user ${message.member!.user.tag} in guild ${message.guild!.name}.`);

        const roles = message.guild!.roles.cache.map(r => r.name); // get roles of the server and map them to their names

        const outputEmbed = new MessageEmbed() // create a new embed for output
        .setColor('#FFFCF4')
        .setTitle(`Roles for ${message.guild!.name}`);

        let outputEmbedText = '';


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

        for (let i = 0; i < roles.length; i++) { // iterate through collection
            outputEmbedText += `**${i + 1}.** ${roles[i]}\n` // add the role to the list
        }

        try { // send output embed with information about the command's success
            outputEmbed.addField('\u200B', outputEmbedText); // add whatever text was accumulated throughout the command to the embed
            if (outputEmbedText !== '') { // check if there is actually any text to send the embed with
                outputEmbed.setDescription(`**Command executed by:** ${message.member!.user.tag}`);
                outputEmbed.setFooter('FYI: in commands involving managing roles, you can refer to roles by their mention or by their number (as shown in this list)');
                await message.channel.send(outputEmbed);
            }
            console.log(`Command listroles, started by ${message.member!.user.tag}, terminated successfully in ${message.guild}.`);
        } catch (e) {
            console.log(`There was an error sending an embed in the guild ${message.guild}! The error message is below:`);
            console.log(e);
        }
    }
}

export = command; // export the command to the main module
