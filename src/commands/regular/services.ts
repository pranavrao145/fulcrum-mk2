import { Message, MessageEmbed } from 'discord.js';
import { ICommand } from '../../utils/types';
import { Client } from 'pg';
import { serviceList } from '../../utils/information';

const command: ICommand = {
    name: 'services',
    description: 'Displays a message detailing the services that Fulcrum offers.',
    syntax: 'f!services',
    async execute(message: Message, _con: Client, args?: string[]) {
        console.log(`Command services started by user ${message.member!.user.tag} in guild ${message.guild!.name}.`);

        const outputEmbed = new MessageEmbed() // create an embed to display the results of the command
            .setColor('#FFFCF4')
            .setTitle('Fulcrum - Services Help')

        let outputEmbedText = '';

        if (args!.length > 0) { // if there is an argument supplied 
            console.log('Found argument supplied, attempting to find information for specific service.');

            const serviceMention = args!.shift()!.toLowerCase(); // get the service they want information about

            if (serviceList.has(serviceMention)) { // if the service is valid and help exists for it
                outputEmbed.setDescription(`**Service:** ${serviceMention}`); // add the command to the help message

                const serviceDescription = serviceList.get(serviceMention); // get the description for the service provided
                outputEmbed.addField('Description', serviceDescription!); // add the description to the output embe 
            } else { // if the service does not exist
                outputEmbed.addField('\u200B', 'Invalid service, no help available.');
            }

            try { // send output embed with information about the command's success
                if (outputEmbed.fields.length > 0) { // check if there are actually any fields to send the embed with
                    await message.channel.send({ embeds: [outputEmbed] });
                }
                console.log(`Command services, started by ${message.member!.user.tag}, terminated successfully in ${message.guild!.name}.`);
            } catch (e) {
                console.log(`There was an error sending an embed in the guild ${message.guild!.name}! The error message is below:`);
                console.log(e);
            }
        } else { // if no service was supplied, list out the services
            outputEmbed.setDescription('General Services Help\nFor information on a specific service, type f!services [service]');

            const validServices = serviceList.keys(); // get the names of the valid services

            for (const service of validServices) {
                outputEmbedText += `\`${service}\` `; // add the command to the output text with a space
            }

            try { // send output embed with information about the command's success
                outputEmbed.addField('Services List', outputEmbedText); // add whatever text was accumulated throughout the command to the embed
                if (outputEmbedText !== '') { // check if there is actually any text to send the embed with
                    await message.channel.send({ embeds: [outputEmbed] });
                }
                console.log(`Command services, started by ${message.member!.user.tag}, terminated successfully in ${message.guild!.name}.`);
            } catch (e) {
                console.log(`There was an error sending an embed in the guild ${message.guild!.name}! The error message is below:`);
                console.log(e);
            }
        }
    }
}

export = command; // export the command to the main module
