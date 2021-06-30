import {Message, MessageEmbed, TextChannel} from 'discord.js';
import {ICommand} from '../../../utils/types';
import {Client} from 'pg';
import {timeout} from '../../../utils/helpers';

const command: ICommand = {
    name: 'unlock',
    description: 'Unlocks the current channel (makes it read and write for the @everyone role, as it is by default).',
    syntax: 'f!unlock',
    async execute(message: Message, _con: Client, _args?: string[]) {
        console.log(`Command unlock started by user ${message.member!.user.tag} in guild ${message.guild!.name}.`);

        const outputEmbed = new MessageEmbed() // create a new embed for output
            .setColor('#FFFCF4')
            .setTitle('Unlock Channel - Report');

        if (!message.member!.hasPermission('MANAGE_CHANNELS')) { // check for adequate permissions
            try {
                console.log('Insufficient permissions. Stopping execution.')
                return await message.reply('sorry, you need to have the `MANAGE_CHANNELS` permission to use this command.');
            } catch (e) {
                console.log(`There was an error sending a message in the guild ${message.guild!.name}! The error message is below:`);
                console.log(e);
                return;
            }
        }


        const messageChannel = message.channel; // get the message's chanel (like this so it can later be cast to TextChannel)

        try {
            await (messageChannel as TextChannel).updateOverwrite((messageChannel as TextChannel).guild.roles.everyone, {SEND_MESSAGES: true}); // set the channel as read only for everyone
            console.log(`Successfully unlocked ${(messageChannel as TextChannel).name}.`);
            outputEmbed.addField('Status', 'Success');
        } catch (e) {
            console.log(`Failed to unlock ${(messageChannel as TextChannel).name}.`);
            outputEmbed.addField('Status', 'Failed');
        }

        try { // send output embed with information about the command's success
            if (outputEmbed.fields.length > 0) { // check if there are actually any fields to send the embed with
                outputEmbed.setDescription(`**Command executed by:** ${message.member!.user.tag}`);
                outputEmbed.setFooter(`This message will be automatically deleted in 5 seconds.`)
                const outputEmbedMessage = await message.channel.send(outputEmbed); // keep track of the message with the embed for deletion
                await timeout(5000); // wait 5 seconds
                await outputEmbedMessage.delete(); // delete output embed message
                await message.delete();
            }
            console.log(`Command unlock, started by ${message.member!.user.tag}, terminated successfully in ${message.guild!.name}.`);
        } catch (e) {
            console.log(`There was an error sending an embed in the guild ${message.guild!.name}! The error message is below:`);
            console.log(e);
        }

    }
}

export = command; // export the command to the main module
