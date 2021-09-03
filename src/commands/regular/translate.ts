import translate from '@iamtraction/google-translate';
import {Message, MessageEmbed} from 'discord.js';
import {ICommand} from '../../utils/types';
import {Client} from 'pg';

const command: ICommand = {
    name: 'translate',
    description: 'Translates the given phrase into the language given. You do not need to specify the language you are translating from; it will be automatically detected.',
    alias: ['tr'],
    syntax: 'f!translate [2 letter code of lang to which to translate]  [phrase]',
    async execute(message: Message, _con: Client, args?: string[]) {
        console.log(`Command translate started by user ${message.member!.user.tag} in guild ${message.guild!.name}.`);

        let outputEmbed = new MessageEmbed() // create an embed to display the results of the command
            .setColor('#FFFCF4')
            .setTitle('Translation');

        if (!args || args.length < 2) { // check if the args exist (this function requires them) and that there are not too many args
            try {
                console.log('Incorrect syntax given. Stopping execution.');
                return await message.channel.send(`Incorrect syntax. Correct syntax: \`${this.syntax}\``)
            } catch (e) {
                console.log(`There was an error sending a message in the guild ${message.guild!.name}! The error message is below:`);
                console.log(e);
                return;
            }
        }

        const toLang = args.shift()!.toLowerCase(); // get the language they want to convert to and format properly
        const phrase = args.join(' '); // join the rest of the message to get the phrase to translate

        try {
            const translation = await translate(phrase, {to: toLang}); // request api for translation with the given data
            outputEmbed.addField(`Translation to ${toLang}`, translation.text);
        } catch (e) {
            console.log('There was an error translating the phrase given.')
            outputEmbed.addField('\u200B', 'Couldn\'t translate phrase.');
        }

        try { // send output embed with information about the command's success
            if (outputEmbed.fields.length > 0) { // check if there are actually any fields to send the embed with
                outputEmbed.setDescription(`**Command executed by:** ${message.member!.user.tag}\n**Phrase translated:** ${phrase}`);
                await message.channel.send({ embeds: [outputEmbed] });
            }
            console.log(`Command translate, started by ${message.member!.user.tag}, terminated successfully in ${message.guild!.name}.`);
        } catch (e) {
            console.log(`There was an error sending an embed in the guild ${message.guild!.name}! The error message is below:`);
            console.log(e);
        }

    }
}

export = command; // export the command to the main module
