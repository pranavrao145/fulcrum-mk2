import {Message, MessageEmbed} from 'discord.js';
import {ICommand} from '../../utils/types';
import {Client} from 'pg';
import {Parser} from 'expr-eval';

const command: ICommand = {
    name: 'math',
    description: 'Evaluates the mathematical expression given by the user.',
    syntax: 'f!math [expression]',
    async execute(message: Message, _con: Client, args?: string[]) {
        console.log(`Command math started by user ${message.member!.user.tag} in guild ${message.guild!.name}.`);

        const outputEmbed = new MessageEmbed() // create an embed to display the results of the command
            .setColor('#FFFCF4')
            .setTitle('Math');

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

        const mathExpression = args.join(''); // join all the args to get the mathematical expression they want to evaluate

        try {
            const result = Parser.evaluate(mathExpression); // attempt to evaluate the expression they give
            console.log(`Expression ${mathExpression} evaluated successfully.`)
            outputEmbed.addField('Result', result);
        } catch (e) { // if the expressions is invalid (fails to evaluate or error)
            console.log('Failed to evaluate expression.')
            outputEmbed.addField('Result', 'Error');
        }

        try { // send output embed with information about the command's success
            if (outputEmbed.fields.length > 0) { // check if there are actually any fields to send the embed with
                outputEmbed.setDescription(`**Command executed by:** ${message.member!.user.tag}\n**Expression evaluated:** ${mathExpression}`);
                await message.channel.send(outputEmbed);
            }
            console.log(`Command math, started by ${message.member!.user.tag}, terminated successfully in ${message.guild!.name}.`);
        } catch (e) {
            console.log(`There was an error sending an embed in the guild ${message.guild!.name}! The error message is below:`);
            console.log(e);
        }

    }
}

export = command; // export the command to the main module
