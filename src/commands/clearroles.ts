import { Message, MessageEmbed } from "discord.js";
import { ICommand } from '../utils/types';
import { Client } from 'pg';
import { getRoleFromMention, timeout } from "../utils/helpers";

const command: ICommand = {
    name: 'clearroles',
    description: 'Removes the given role from all users that have it.',
    alias: ['clr'],
    syntax: 'f!clearroles [role mentions (10 max)]',
    async execute(message: Message, con: Client, args?: string[]) {
        console.log(`Command clearroles started by user ${message.member!.user.tag} in guild ${message.guild!.name}.`);

        let outputEmbed = new MessageEmbed() // create an embed to display the results of the command
        .setColor('#FFFCF4')
        .setTitle('Assign Roles - Report')

        if (!message.member!.hasPermission('MANAGE_ROLES')) { // check for adequate permissions
            console.log('Checking permissions...')
            try {
                console.log('Insufficient permissions, stopping execution.')
                return await message.reply('sorry, you need to have the MANAGE_ROLES permission to use this command.');
            } catch (e) {
                console.log(`There was an error sending a message in the guild ${message.guild}! The error message is below:`);
                console.log(e);
            }
        }

        if (!args || args.length < 2 || args.length > 11) { // check if the args exist (this function requires them) and that there are not too many args
            console.log('Checking validity of arguments...')
            try {
                console.log('Incorrect syntax given, stopping execution.');
                return await message.channel.send(`Incorrect syntax! Correct syntax: ${this.syntax}`)
            } catch (e) {
                console.log(`There was an error sending a message in the guild ${message.guild}! The error message is below:`);
                console.log(e);
            }
        }
        
    }
}
