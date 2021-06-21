import {Message, MessageEmbed} from 'discord.js';
import {ICommand} from '../../utils/types';
import {Client} from 'pg';

const command: ICommand = {
    name: 'setup',
    description: 'Sets up the service given by the user.',
    alias: ['set, su'],
    syntax: 'f!setup [service]',
    async execute(message: Message, con: Client, args?: string[]) {
        console.log(`Command setup started by user ${message.member!.user.tag} in guild ${message.guild!.name}.`);

        let outputEmbed = new MessageEmbed() // create an embed to display the results of the command
            .setColor('#FFFCF4')
            .setTitle('Setup - Report')

        if (!args || args.length < 1) { // check if the args exist (this function requires them) and that there are not too many args
            try {
                console.log('Incorrect syntax given. Stopping execution.');
                return await message.channel.send(`Incorrect syntax! Correct syntax: \`${this.syntax}\``)
            } catch (e) {
                console.log(`There was an error sending a message in the guild ${message.guild}! The error message is below:`);
                console.log(e);
                return;
            }
        }

        const service = args.shift()!.toLowerCase(); // get the service the user is trying to update and format it

        switch (service) { // check to see which service was mentioned
        }

    }
}
