import {Message, MessageEmbed} from 'discord.js';
import {ICommand} from '../../../utils/types';
import {Client} from 'pg';
import {timeout} from '../../../utils/helpers';

const command: ICommand = {
    name: 'purgechat',
    description: 'Clears the amount of messages given. The number of messages you want to clear must be between 2 and 100.',
    alias: ['pc'],
    syntax: 'f!purgechat [number of messages to clear (2-100)]',
    async execute(message: Message, _con: Client, args?: string[]) {
        console.log(`Command purgechat by user ${message.member!.user.tag} in guild ${message.guild!.name}.`);

        let outputEmbed = new MessageEmbed() // create an embed to display the results of the command
            .setColor('#FFFCF4')
            .setTitle('Purge Chat - Report')

        if (!message.member!.permissions.has('MANAGE_MESSAGES')) { // check for adequate permissions
            try {
                console.log('Insufficient permissions. Stopping execution.')
                return await message.reply('sorry, you need to have the `MANAGE_MESSAGES` permission to use this command.');
            } catch (e) {
                console.log(`There was an error sending a message in the guild ${message.guild!.name}! The error message is below:`);
                console.log(e);
                return;
            }
        }

        if (!args || args.length === 0) { // check if the args exist (this function requires them) and that there are not too many args
            try {
                console.log('Incorrect syntax given. Stopping execution.');
                return await message.channel.send(`Incorrect syntax. Correct syntax: \`${this.syntax}\``)
            } catch (e) {
                console.log(`There was an error sending a message in the guild ${message.guild!.name}! The error message is below:`);
                console.log(e);
                return;
            }
        }

        const num = args.shift(); // get the number of messages they want to delete
        const parsedNum = parseInt(num!); // parse the integer from the number given

        if (isNaN(parsedNum)) { // check if the number given is not a valid number.
            try {
                console.log('Invalid value given for number of messages. Stopping execution.')
                return await message.channel.send('Invalid number. Must be a number from 2 to 100.')
            } catch (e) {
                console.log(`There was an error sending a message in the guild ${message.guild!.name}! The error message is below:`);
                console.log(e);
                return;
            }

        }

        if (!(parsedNum <= 100 && parsedNum >= 2)) { // check if the number is in the valid range
            try {
                console.log('Invalid value given for number of messages. Stopping execution.')
                return await message.channel.send('Invalid number. Must be a number from 2 to 100.')
            } catch (e) {
                console.log(`There was an error sending a message in the guild ${message.guild!.name}! The error message is below:`);
                console.log(e);
                return;
            }
        }

        if (message.channel.type !== 'text') { // check if the channel type is actually a text channel (or can't bulk delete)
            try {
                console.log('Invalid channel type for purge chat. Stopping execution.');
                return await message.channel.send('Can\'t use purgechat in this type of channel!')
            } catch (e) {
                console.log(`There was an error sending a message in the guild ${message.guild!.name}! The error message is below:`);
                console.log(e);
                return;
            }
        }

        try {
            await message.delete(); // attempt to delete the original message
            await message.channel.bulkDelete(parsedNum); // attempt to delete the number of messages specified
        } catch (e) {
            console.log(`Failed to delete messages in ${message.channel.name}`);
            outputEmbed.addField('Status', 'Failed');
        }

        try { // send output embed with information about the command's success
            if (outputEmbed.fields.length > 0) { // check if there are actually any fields to send the embed with
                outputEmbed.setDescription(`**Command executed by:** ${message.member!.user.tag}`);
                outputEmbed.setFooter(`This message will be automatically deleted in 5 seconds.`)
                const outputEmbedMessage = await message.channel.send(outputEmbed); // keep track of the message with the embed for deletion
                await timeout(5000); // wait 5 seconds
                await outputEmbedMessage.delete(); // delete output embed message
            }
            console.log(`Command purgechat, started by ${message.member!.user.tag}, terminated successfully in ${message.guild!.name}.`);
        } catch (e) {
            console.log(`There was an error sending an embed in the guild ${message.guild!.name}! The error message is below:`);
            console.log(e);
        }
    }
}

export = command; // export the command to the main module
