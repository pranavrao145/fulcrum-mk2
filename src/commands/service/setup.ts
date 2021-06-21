import {Message, MessageEmbed} from 'discord.js';
import {ICommand} from '../../utils/types';
import {Client} from 'pg';
import {timeout} from '../../utils/helpers';

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

        let overallSuccess = true; // to keep track of whether or not the function was overall successful

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

        switch (service) { // check to see which service was mentioned. Possibilities: vcroles, channelcount, membercount, date
            case "vcroles": // if the user wants to set up voice channel roles
                try {
                    await message.channel.send('Setting up voice channel roles. This may take a moment...');
                } catch (e) {
                    console.log(`There was an error sending a message in the guild ${message.guild}! The error message is below:`);
                    console.log(e);
                }
                const voiceChannelIDs = message.guild!.channels.cache.filter(c => c.type === 'voice').map(c => c.id); // get all the voice channels in the guild and map them to their ids
                
                if (!voiceChannelIDs) { // if no voice channels exist in this guild
                    console.log('No voice channels found in guild. Stopping execution.');
                    break;
                }

                for (const voiceChannelID of voiceChannelIDs) { // iterate through all voice channels 
                    const voiceChannel = message.guild!.channels.cache.get(voiceChannelID); // get the voice channel from the id

                    if (!voiceChannel) { // if the voice channel does not exist
                        console.log('A voice channel did not exist. Skipping over it.');
                        continue;
                    } 

                    const vcRole = message.guild!.roles.cache.find(r => r.name === voiceChannel.name) // try to get a role with the same name as the voice channel (the one associated with it)

                    if (vcRole) { // check if the role already exists
                        console.log('A voice channel already had an associated voice channel role. Skipping over it.');
                        continue;
                    }

                    try { // if the role doesn't exist, attempt to create it
                        await timeout(300);
                        await message.guild!.roles.create({ // create the role with the same name as the voice channel
                            data: {
                                name: voiceChannel.name,
                            }
                        })
                        console.log(`Voice channel role ${voiceChannel.name} created successfully.`)
                    }
                    catch (e) {
                        overallSuccess = false;
                        console.log(`Failed to create voice channel role ${voiceChannel.name}.`);
                    }
                }

                break;
            case "channelcount":
                break;
            case "membercount":
                break;
            case "date":
                break;
            default:
                break;
        }

    }
}
