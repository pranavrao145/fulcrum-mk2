import { Channel, Message, MessageEmbed, TextChannel } from 'discord.js';
import { ICommand } from '../../utils/types';
import { Client } from 'pg';

const command: ICommand = {
    name: 'start',
    description: 'Displays a start message for Fulcrum.',
    syntax: 'f!start',
    async execute(message: Message | Channel, _con: Client, _args?: string[]) {
        if (message instanceof Message) { // if someone manually requested the start message
            console.log(`Command start started by user ${message.member!.user.tag} in guild ${message.guild!.name}.`);

            const outputEmbed = new MessageEmbed() // create a new embed for output
                .setColor('#FFFCF4')
                .setTitle(`Fulcrum - Start`)
                .addFields(
                    {
                        name: 'Prefix',
                        value:
                            'Fulcrum\'s prefix is **f!**. \nYou can use any of Fulcrum\'s commands with this prefix.',
                    },
                    {
                        name: 'Help',
                        value: 'To see a full list of Fulcrum\'s commands, run f!help.',
                    },
                    {
                        name: 'Services',
                        value: 'To see a full list of the services Fulcrum offers and how to set them up, run f!services.',
                    },
                )

            try { // send output embed with information about the command's success
                if (outputEmbed.fields.length > 0) { // check if there are actually any fields to send the embed with
                    outputEmbed.setDescription(`Thanks for adding Fulcrum! Read below to get started!`);
                    await message.channel.send({ embeds: [outputEmbed] });
                }
                console.log(`Command start, started by ${message.member!.user.tag}, terminated successfully in ${message.guild!.name}.`);
            } catch (e) {
                console.log(`There was an error sending an embed in the guild ${message.guild!.name}! The error message is below:`);
                console.log(e);
            }
        } else { // if it was triggered automatically (like on joining a guil )
            console.log(`Ambient start command triggered in ${(message as TextChannel).guild.name}.`);

            const outputEmbed = new MessageEmbed() // create a new embed for output
                .setColor('#FFFCF4')
                .setTitle(`Fulcrum - Start`)
                .addFields(
                    {
                        name: 'Prefix',
                        value:
                            'Fulcrum\'s prefix is **f!**. \nYou can use any of Fulcrum\'s commands with this prefix.',
                    },
                    {
                        name: 'Help',
                        value: 'To see a full list of Fulcrum\'s commands, run f!help.',
                    },
                    {
                        name: 'Services',
                        value: 'To see a full list of the services Fulcrum offers and how to set them up, run f!services.',
                    },
                )

            try { // send output embed with information about the command's success
                if (outputEmbed.fields.length > 0) { // check if there are actually any fields to send the embed with
                    outputEmbed.setDescription(`Thanks for adding Fulcrum! Read below to get started!`);
                    await (message as TextChannel).send({ embeds: [outputEmbed] });
                }
                console.log('Ambient start message ')
                console.log(`Ambient start message sequence completed successfully in ${(message as TextChannel).guild.name}.`);
            } catch (e) {
                console.log(`There was an error sending an embed in the guild ${(message as TextChannel).guild}! The error message is below:`);
                console.log(e);
            }
        }
    }
}

export = command; // export the command to the main module
