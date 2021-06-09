import { Message, MessageEmbed } from 'discord.js';
import { ICommand } from '../utils/types';
import { Client } from 'pg';
import { getUserFromMention } from '../utils/helpers';

const command: ICommand = {
    name: 'ban',
    description: 'Bans the given user from the server.',
    syntax: 'f!ban [user mention] (days 0-7, 0 default) (reason)',
    async execute(message: Message, con: Client, args?: string[]) {
        console.log(`Command ban started by user ${message.member!.user.tag} in guild ${message.guild!.name}.`);

        let outputEmbed = new MessageEmbed() // create an embed to display the results of the command
        .setColor('#FFFCF4')
        .setTitle('Ban - Report')

        if (!message.member!.hasPermission('BAN_MEMBERS')) { // check for adequate permissions
            try {
                console.log('Insufficient permissions. Stopping execution.')
                return await message.reply('sorry, you need to have the BAN_MEMBERS permission to use this command.');
            } catch (e) {
                console.log(`There was an error sending a message in the guild ${message.guild}! The error message is below:`);
                console.log(e);
            }
        }

        if (!args || args.length === 0) { // check if the args exist (this function requires them) and that there are not too many args
            console.log('Checking validity of arguments...')
            try {
                console.log('Incorrect syntax given. Stopping execution.');
                return await message.channel.send(`Incorrect syntax! correct syntax: ${this.syntax}`)
            } catch (e) {
                console.log(`There was an error sending a message in the guild ${message.guild}! The error message is below:`);
                console.log(e);
            }
        }

        const userMention = args!.shift(); // get the user mention
        const days = args!.shift(); // get the days the user wants to ban the member for
        const reasonToBan = args!.join(' '); // get the potential reason to ban by joining the rest of the args

        const member = getUserFromMention(message, userMention!);

        if (!member) { // check if the user supplied was valid
            console.log('User supplied was invalid. Stopping execution.');
            try {
                await message.channel.send('Invalid user!');
                return;
            } catch (e) {
                console.log(`There was an error sending a message in the guild ${message.guild}! The error message is below:`);
                console.log(e);
            }
        }

        if (days) { // check if the number of days was given
            console.log("Checking validity of value given for argument 'days'.")
            const daysNum = parseInt(days, 10)
            if (isNaN(daysNum)) { // checks if the value for days is a number
                // TODO: Figure out why this check doesn't work
                console.log("Invalid input for argument 'days'. Stopping execution.")
                try {
                    await message.channel.send("Invalid argument for days! Must be a number from 0-7.");
                    return;
                } catch (e) {
                    console.log(`There was an error sending a message in the guild ${message.guild}! The error message is below:`);
                    console.log(e);
                }
            }

            if (daysNum < 0 || daysNum > 7) { // check if the value of days (which is definitely a number) is in the allowed range
                try {
                    await message.channel.send("Invalid number for days! Must be a number from 0-7.");
                    return;
                } catch (e) {
                    console.log(`There was an error sending a message in the guild ${message.guild}! The error message is below:`);
                    console.log(e);
                }
            }
        }

        if (reasonToBan) { // checks if there is a reason to ban (and by extension a value for days given)
            try {
                await member!.ban({ // ban the user with the number of days and the reason
                    days: parseInt(days!, 10),
                    reason: reasonToBan
                });
                console.log(`User ${member!.user.tag} banned successfully.`);
                outputEmbed.addField('Status', 'Success');
                outputEmbed.addField('Days', `${days}`);
                outputEmbed.addField('Reason', `${reasonToBan}`);
            } catch (e) {
                console.log(`Failed to ban user ${member!.user.tag}.`)
                outputEmbed.addField('Status', 'Failed');
            }
        } else if (days) { // if a reason was not provided, but the number of days was
            try {
                await member!.ban({ // ban the user with the number of days and the reason
                    days: parseInt(days!, 10),
                });
                console.log(`User ${member!.user.tag} banned successfully.`);
                outputEmbed.addField('Status', 'Success');
                outputEmbed.addField('Days', `${days}`);
            } catch (e) {
                console.log(`Failed to ban user ${member!.user.tag}.`)
                outputEmbed.addField('Status', 'Failed');
            }
        } else { // if nothing but the user was provided
            try {
                await member!.ban();
                console.log(`User ${member!.user.tag} banned successfully.`);
                outputEmbed.addField('Status', 'Success');
            } catch (e) {
                console.log(`Failed to ban user ${member!.user.tag}.`)
                outputEmbed.addField('Status', 'Failed');
            }
        }

        try { // send output embed with information about the command's success
            if (outputEmbed.fields.length > 0) { // check if there are actually any fields to send the embed with
                outputEmbed.setDescription(`**Command executed by:** ${message.member!.user.tag}\n**User banned:** ${member!.user.tag}`);
                await message.channel.send(outputEmbed);
            }
            console.log(`Command ban, started by ${message.member!.user.tag}, terminated successfully in ${message.guild}.`);
        } catch (e) {
            console.log(`There was an error sending an embed in the guild ${message.guild}! The error message is below:`);
            console.log(e);
        }
    }
}

export = command; // export the command to the main module
