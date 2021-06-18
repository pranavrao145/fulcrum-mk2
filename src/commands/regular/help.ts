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
    admin: false,
    async execute(message: Message, _con: Client, args?: string[]) {
        console.log(`Command help started by user ${message.member!.user.tag} in guild ${message.guild!.name}.`);

        let outputEmbed = new MessageEmbed() // create an embed to display the results of the command
            .setColor('#FFFCF4')
            .setTitle('Help');

        // the way the program is written means there is no direct access to the client's commands, so they must be read again

        // prepare to read command files
        const globPromise = promisify(glob);
        const commands: Array<ICommand> = [];

        // load in command files
        const commandFiles = await globPromise(`${__dirname}/../**/*.{js,ts}`); // identify command files

        for (const file of commandFiles) {
            const command = await import(file);
            commands.push(command);
        }


        if (args!.length > 0) { // if there are actually arguments found 
            console.log('Found argument supplied, attempting to find help for specific command.');

            const commandName = args!.shift(); // get the name of the command specified
            const command = commands.find(c => c.name === commandName || (c.alias ? c.alias!.includes(commandName!) : false)); // attempt to find the command by name or alias

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

                try { // send output embed with information about the command's success
                    if (outputEmbed.fields.length > 0) { // check if there are actually any fields to send the embed with
                        await message.channel.send(outputEmbed);
                    }
                    console.log(`Command help, started by ${message.member!.user.tag}, terminated successfully in ${message.guild}.`);
                } catch (e) {
                    console.log(`There was an error sending an embed in the guild ${message.guild}! The error message is below:`);
                    console.log(e);
                }
            } else { // if command not found
                outputEmbed.addField('\u200B', 'Invalid command, no help available.');

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
        } else { // if the original message does not contain any arguments (general help message)
            outputEmbed.setDescription('General Help\nFor information on a specific command, type f!help [command]');

            const adminCommands = commands.filter(c => c.admin === true).map(c => c.name); // get the admin commands
            const nonAdminCommands = commands.filter(c => c.admin === false).map(c => c.name); // get the non admin commands

            let adminOutputEmbedText = '';
            let nonAdminOutputEmbedText = '';

            for (const commandName of adminCommands) {
                adminOutputEmbedText += `\`${commandName}\` `; // add the command to the output text with a space
            }

            for (const commandName of nonAdminCommands) {
                nonAdminOutputEmbedText += `\`${commandName}\` `; // add the command to the output text with a space
            }

            if (adminOutputEmbedText) { // check if there are actually admin commands to output
                outputEmbed.addField('Admin Commands', adminOutputEmbedText);
            }

            if (nonAdminOutputEmbedText) { // check if there are actually regular commands to output
                outputEmbed.addField('Regular Commands', nonAdminOutputEmbedText);
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
