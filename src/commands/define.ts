import {Message, MessageEmbed} from 'discord.js';
import {ICommand} from '../utils/types';
import {Client} from 'pg';
import get from 'axios';

const command: ICommand = {
    name: 'define',
    description: 'Defines the given English word.',
    alias: ['df'],
    syntax: 'f!define [word]',
    async execute(message: Message, _con: Client, args?: string[]) {
        console.log(`Command define started by user ${message.member!.user.tag} in guild ${message.guild!.name}.`);

        let outputEmbed = new MessageEmbed() // create an embed to display the results of the command
            .setColor('#FFFCF4')
            .setTitle('Define - Result')

        if (!args || args.length === 0) { // check if the args exist (this function requires them) and that there are not too many args
            try {
                console.log('Incorrect syntax given. Stopping execution.');
                return await message.channel.send(`Incorrect syntax! Correct syntax: ${this.syntax}`)
            } catch (e) {
                console.log(`There was an error sending a message in the guild ${message.guild}! The error message is below:`);
                console.log(e);
                return;
            }
        }

        const word = args.shift(); // get the word from the arguments

        try { // attempt to get the definition from the api 
            const response = await get(`https://api.dictionaryapi.dev/api/v2/entries/en_US/${word}`);
            console.log(response.data);
        } catch (e) {
            console.log(e);
        }

    }
}

export = command; // export the command to the main module
