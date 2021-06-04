import { ICommand } from '../utils/types';
import { Message, MessageEmbed } from 'discord.js';
import { Client } from 'pg';

const command: ICommand = {
    name: 'createroles',
    description: 'Creates role(s) with the given name(s)',
    alias: ['crs'],
    syntax: 'f!createroles [role names (10 max)]', 
    async execute(message: Message, con: Client, args?: string[]) {
        console.log(`Command createroles started by user ${message.member!.user.tag} in guild ${message.guild!.name}.`);


        let outputEmbed = new MessageEmbed() // create an embed to display the results of the command
        .setColor('#FFFCF4')
        .setTitle('Create Roles - Report')

        let outputEmbedText: string = ''; // text that will eventually be sent as a field in outputEmbed. Mainly for formatting

        if (!message.member!.hasPermission('MANAGE_ROLES')) { // check for adequate permissions
            console.log('Checking permissions...')
            try {
                console.log('Insufficient permissions. Stopping execution.')
                return await message.reply('sorry, you need to have the MANAGE_ROLES permission to use this command.');
            } catch (e) {
                console.log(`There was an error sending a message in the guild ${message.guild}! The error message is below:`);
                console.log(e);
            }
        }

        if (!args || args.length === 0 || args.length < 1 || args.length > 10) { // check if the args exist (this function requires them) and that there are not too many args
            console.log('Checking validity of arguments...')
            try {
                console.log('Incorrect syntax given. Stopping execution.');
                return await message.channel.send(`Incorrect syntax! Correct syntax: ${this.syntax}`)
            } catch (e) {
                console.log(`There was an error sending a message in the guild ${message.guild}! The error message is below:`);
                console.log(e);
            }
        }
    }
}
