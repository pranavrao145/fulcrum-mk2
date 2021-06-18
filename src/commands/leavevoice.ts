import {ICommand} from '../utils/types';
import {Message} from 'discord.js';
import {Client} from 'pg';

const command: ICommand = {
    name: 'leavevoice',
    description: 'Makes the user leave the voice channel they are currently in.',
    alias: ['lv', 'l'],
    syntax: 'f!leavevoice',
    admin: false,
    async execute(message: Message, _con: Client, _args?: string[]) {
        console.log(`Command leavevoice started by user ${message.member!.user.tag} in guild ${message.guild!.name}.`);

        try {
            const channel = message.member!.voice.channel; // get the channel the user is in

            if (channel) { // if they're actually in a channel
                message.member!.voice.setChannel(null); // attempt to remove the member from the voice channel they are currently in
            }

            console.log(`${message.member!.user.tag} removed from ${channel!.name} successfully.`)
        } catch (e) {
            console.log(`Failed to remove user ${message.member!.user.tag} from voice channel or user not in voice channel.`);
        }

        console.log(`Command leavevoice, started by ${message.member!.user.tag}, terminated successfully in ${message.guild}.`);
    }
}

export = command; // export the command to the main module
