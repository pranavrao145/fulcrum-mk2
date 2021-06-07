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
            console.log('Checking permissions...')
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

        const user = getUserFromMention(message, userMention!);

        if (!user) { // check if the user supplied was valid
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
            if (isNaN(parseInt(days))) { // checks if the value for days is a number
                console.log("Invalid input for argument 'days'. Stopping execution.")
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
            await user!.ban();
        } else if (days) { // if a reason was not provided, but the number of days was

        } else { // if nothing but the user was provided

        }

    }
}
