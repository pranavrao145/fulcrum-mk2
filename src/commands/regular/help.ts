import {Message, MessageEmbed} from 'discord.js';
import {ICommand} from '../../utils/types';
import {Client} from 'pg';
import {promisify} from 'util'
import glob from 'glob';

const command: ICommand = {
    name: 'help',
    description: 'Displays a general help message, or for a specific command if specified.',
    alias: ['h'],
    syntax: 'f!help (command name)',
    async execute(message: Message, _con: Client, args?: string[]) {
        console.log(`Command help started by user ${message.member!.user.tag} in guild ${message.guild!.name}.`);

        const outputEmbed = new MessageEmbed() // create an embed to display the results of the command
            .setColor('#FFFCF4')
            .setTitle('Help');

        // the way the program is written means there is no direct access to the client's commands, so they must be read again

        // prepare to read command files for different categories of commands
        const globPromise = promisify(glob);
        const allComands: Array<ICommand> = [];
        const adminCommands: Array<ICommand> = [];
        const regularCommands: Array<ICommand> = [];
        const serviceCommands: Array<ICommand> = [];

        // load in command files for different categories of commands
        const adminCommandFiles = await globPromise(`${__dirname}/../admin/**/*.{js,ts}`); // identify command files
        const regularCommandFiles = await globPromise(`${__dirname}/../regular/**/*.{js,ts}`); // identify command files
        const serviceCommandFiles = await globPromise(`${__dirname}/../service/**/*.{js,ts}`); // identify command files

        for (const file of adminCommandFiles) {
            const command = await import(file);
            adminCommands.push(command);
            allComands.push(command);
        }

        for (const file of regularCommandFiles) {
            const command = await import(file);
            regularCommands.push(command);
            allComands.push(command);
        }

        for (const file of serviceCommandFiles) {
            const command = await import(file);
            serviceCommands.push(command);
            allComands.push(command);
        }


        if (args!.length > 0) { // if there are actually arguments found 
            console.log('Found argument supplied, attempting to find help for specific command.');

            const commandName = args!.shift(); // get the name of the command specified
            const command = allComands.find(c => c.name === commandName || (c.alias ? c.alias!.includes(commandName!) : false)); // attempt to find the command by name or alias

            if (command) { // if a command is found
                // extract info about the command
                const name = command.name;
                const aliases = command.alias;
                const syntax = command.syntax;
                const description = command.description;

                outputEmbed.setDescription(`**Command:** ${name}`); // add the command to the help message

                if (aliases) { // check if alias(es) exist for this command
                    const aliasesFormatted = aliases.join(', '); // join the array of aliases by a comma for pretty printing in the embed
                    outputEmbed.addField('Alias(es)', aliasesFormatted); // add alias info to output embed
                }

                // add other relevant info to output embed
                outputEmbed.addField('Syntax', syntax);
                outputEmbed.addField('Description', description);
            } else { // if command not found
                outputEmbed.addField('\u200B', 'Invalid command, no help available.');
            }
                try { // send output embed with information about the command's success
                    if (outputEmbed.fields.length > 0) { // check if there are actually any fields to send the embed with
                        await message.channel.send(outputEmbed);
                    }
                    console.log(`Command help, started by ${message.member!.user.tag}, terminated successfully in ${message.guild}.`);
                } catch (e) {
                    console.log(`There was an error sending an embed in the guild ${message.guild!.name}! The error message is below:`);
                    console.log(e);
                }
        } else { // if the original message does not contain any arguments (general help message)
            outputEmbed.setDescription('General Help\nUse the prefix **f!** before any of these commands\nFor information on a specific command, type f!help [command]');


            let adminOutputEmbedText = '';
            let regularOutputEmbedText = '';
            let serviceOutputEmbedText = '';

            for (const command of adminCommands) {
                adminOutputEmbedText += `\`${command.name}\` `; // add the command to the output text with a space
            }

            for (const command of regularCommands) {
                regularOutputEmbedText += `\`${command.name}\` `; // add the command to the output text with a space
            }

            for (const command of serviceCommands) {
                serviceOutputEmbedText += `\`${command.name}\` `; // add the command to the output text with a space
            }

            if (adminOutputEmbedText) { // check if there are actually admin commands to output
                outputEmbed.addField('Admin Commands', adminOutputEmbedText);
            }

            if (regularOutputEmbedText) { // check if there are actually regular commands to output
                outputEmbed.addField('Regular Commands', regularOutputEmbedText);
            }

            if (serviceOutputEmbedText) { // check if there are actually service commands to output
                outputEmbed.addField('Service Commands', serviceOutputEmbedText);
            }

            try { // send output embed with information about the command's success
                if (outputEmbed.fields.length > 0) { // check if there are actually any fields to send the embed with
                    await message.channel.send(outputEmbed);
                }
                console.log(`Command help, started by ${message.member!.user.tag}, terminated successfully in ${message.guild}.`);
            } catch (e) {
                console.log(`There was an error sending an embed in the guild ${message.guild}! The error message is below:`);
                console.log(e);
            }

        }
    }
}

export = command; // export the command to the main module
