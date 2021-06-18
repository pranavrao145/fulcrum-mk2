import {Message, MessageEmbed} from 'discord.js';
import {ICommand} from '../utils/types';
import {Client} from 'pg';
import {promisify} from 'util'
import glob from 'glob';

const command: ICommand = {
    name: 'help',
    description: 'Displays a general help message, or for a specific command if specified.',
    alias: ['h'],
    syntax: 'f!help (command name)',
    async execute(message: Message, _con: Client, args?: string[]) {

        let outputEmbed = new MessageEmbed() // create an embed to display the results of the command
            .setColor('#FFFCF4')

        if (args!.length > 0) { // if there are actually arguments found 
            console.log('Found argument supplied, attempting to find help for specific command.');

            // the way the program is written means there is no direct access to the client's commands, so they must be read again

            // prepare to read command files
            const globPromise = promisify(glob);
            const commands: Array<ICommand> = [];

            // load in command files
            const commandFiles = await globPromise(`${__dirname}/commands/*.{js,ts}`); // identify command files

            for (const file of commandFiles) {
                const command = await import(file);
                commands.push(command);
            }


            const commandName = args!.shift(); // get the name of the command specified

            const command = commands.find(c => c.name === commandName || (c.alias ? c.alias!.includes(commandName!) : false)); // attempt to find the command by name or alias

        }
    }
}
