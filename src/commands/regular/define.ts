import {Message, MessageEmbed} from 'discord.js';
import {ICommand} from '../../utils/types';
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
            .setTitle('Definitions List')

        if (!args || args.length === 0) { // check if the args exist (this function requires them) and that there are not too many args
            try {
                console.log('Incorrect syntax given. Stopping execution.');
                return await message.channel.send(`Incorrect syntax! Correct syntax: \`${this.syntax}\``)
            } catch (e) {
                console.log(`There was an error sending a message in the guild ${message.guild}! The error message is below:`);
                console.log(e);
                return;
            }
        }

        const word = args.shift(); // get the word from the arguments

        try { // attempt to get the definition from the api  
            const response = await get(`https://api.dictionaryapi.dev/api/v2/entries/en_US/${word}`);

            const meanings = response.data[0]['meanings']; // extract the data from the api response

            for (const meaning of meanings) {
                const partOfSpeech = meaning['partOfSpeech']; // get the part of speech
                const definition = meaning['definitions'][0]['definition']; // get the defintion

                const partOfSpeechFormatted = partOfSpeech.charAt(0).toUpperCase() + partOfSpeech.slice(1);
                outputEmbed.addField(partOfSpeechFormatted, definition); // add the part of speech and the definition to the output embed
            }
        } catch (e) { // if the api returns no response or an error
            console.log(`No defintions found for word ${word} or error getting definitions.`);
            outputEmbed.addField('\u200B', 'No definitions found.');
        }


        try { // send output embed with information about the command's success
            if (outputEmbed.fields.length > 0) { // check if there are actually any fields to send the embed with
                outputEmbed.setDescription(`**Command executed by:** ${message.member!.user.tag}\n**Word defined:** ${word}`);
                await message.channel.send(outputEmbed);
            }
            console.log(`Command define, started by ${message.member!.user.tag}, terminated successfully in ${message.guild}.`);
        } catch (e) {
            console.log(`There was an error sending an embed in the guild ${message.guild!.name}! The error message is below:`);
            console.log(e);
        }

    }
}

export = command; // export the command to the main module
