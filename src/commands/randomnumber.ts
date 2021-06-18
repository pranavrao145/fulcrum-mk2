import {Message, MessageEmbed} from 'discord.js';
import {ICommand} from '../utils/types';
import {Client} from 'pg';
import {getRandomInteger} from '../utils/helpers';


const command: ICommand = {
    name: 'randomnumber',
    description: 'Gives a random number in the range specified.',
    alias: ['rn'],
    syntax: 'f!randomnumber [min] [max]',
    admin: false,
    async execute(message: Message, _con: Client, args?: string[]) {
        console.log(`Command randomnumber started by user ${message.member!.user.tag} in guild ${message.guild!.name}.`);

        let outputEmbed = new MessageEmbed() // create an embed to display the results of the command
            .setColor('#FFFCF4')
            .setTitle('Random Number')

        if (!args || args.length < 2) { // check if the args exist (this function requires them) and that there are not too many args
            try {
                console.log('Incorrect syntax given. Stopping execution.');
                return await message.channel.send(`Incorrect syntax! Correct syntax: \`${this.syntax}\``)
            } catch (e) {
                console.log(`There was an error sending a message in the guild ${message.guild}! The error message is below:`);
                console.log(e);
                return;
            }
        }

        const min = args.shift(); // get the minimum number given
        const max = args.shift(); // get the maximum number given  
 
        // conver the strings to integers for validation and comparison
        const numMin = parseInt(min!);
        const numMax= parseInt(max!);

        if(isNaN(numMin) || isNaN(numMax)) { // if either the minimum or the maximum is not a number
            try {
                console.log('Invalid value given for minimum or maximum value. Stopping execution.')
                return await message.channel.send('Invalid number for one or more arguments!');
            } catch (e) {
                console.log(`There was an error sending a message in the guild ${message.guild}! The error message is below:`);
                console.log(e);
                return;
            }
        }

        const randomNumber = getRandomInteger(numMin, numMax); // get a random number between the range
        outputEmbed.addField('Result', `${randomNumber}`); // add the result to the ouput embed

        try { // send output embed with information about the command's success
            if (outputEmbed.fields.length > 0) { // check if there are actually any fields to send the embed with
                outputEmbed.setDescription(`**Command executed by:** ${message.member!.user.tag}\n\n**Range start:** ${numMin}\n**Range end:** ${numMax}`);
                await message.channel.send(outputEmbed);
            }
            console.log(`Command randomnumber, started by ${message.member!.user.tag}, terminated successfully in ${message.guild}.`);
        } catch (e) {
            console.log(`There was an error sending an embed in the guild ${message.guild}! The error message is below:`);
            console.log(e);
        }
    }
}

export = command; // export the command to the main module
