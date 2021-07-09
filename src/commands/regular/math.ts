
import {Message, MessageEmbed} from 'discord.js';
import {ICommand} from '../../utils/types';
import {Client} from 'pg';
import get from 'axios';

const command: ICommand = {
    name: 'math',
    description: 'Evaluates the mathematical expression given by the user.',
    syntax: 'f!math [expression]',
    async execute(message: Message, _con: Client, args?: string[]) {
        console.log(`Command define started by user ${message.member!.user.tag} in guild ${message.guild!.name}.`);
        if (!args || args.length === 0) { // check if the args exist (this function requires them) and that there are not too many args
            try {
                console.log('Incorrect syntax given. Stopping execution.');
                return await message.channel.send(`Incorrect syntax! Correct syntax: \`${this.syntax}\``)
            } catch (e) {
                console.log(`There was an error sending a message in the guild ${message.guild!.name}! The error message is below:`);
                console.log(e);
                return;
            }
        }

    }
}
