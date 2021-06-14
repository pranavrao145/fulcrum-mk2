import { ICommand } from '../utils/types';
import { Message, MessageEmbed } from 'discord.js';
import { Client } from 'pg';

const command: ICommand = {
    name: 'listroles',
    description: 'Displays all the roles in the server in a list with numbers. For use with other role management commands.',
    alias: ['lr'],
    syntax: 'f!listroles',
    async execute(message: Message, _con: Client, args?: string[]) {
        console.log(`Command listroles started by user ${message.member!.user.tag} in guild ${message.guild!.name}.`);

        const roles = message.guild!.roles.cache.map(r => r.name); // get roles of the server and map them to their names

        const outputEmbed = new MessageEmbed() // create a new embed for output
        .setColor('#FFFCF4')
        .setTitle(`Roles for ${message.guild!.name}`);

        for (let i = 0; i < roles.length; i++) { // iterate through collection
            outputEmbed.addField('\u200B', `**${i + 1}.** ${roles[i]}`, true);
        }

        try { // send output embed with information about the command's success
            if (outputEmbed.fields.length > 0) { // check if there are actually any fields to send the embed with
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
