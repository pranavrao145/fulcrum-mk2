import {Message, MessageEmbed} from 'discord.js';
import {ICommand} from '../../utils/types';
import {Client} from 'pg';
import {getChannelFromMention, getRoleFromMention, getUserFromMention} from '../../utils/helpers';

const command: ICommand = {
    name: 'createchannel',
    description: 'Creates a channel based on the given information.',
    alias: ['cc'],
    syntax: 'f!createchannel [name (underscores for spaces)] (*text*/voice) (*public*/private)',
    async execute(message: Message, _con: Client, args?: string[]) {
        console.log(`Command createchannel started by user ${message.member!.user.tag} in guild ${message.guild!.name}.`);

        let outputEmbed = new MessageEmbed() // create an embed to display the results of the command
            .setColor('#FFFCF4')
            .setTitle('Create Channel - Report');

        if (!message.member!.hasPermission('MANAGE_CHANNELS')) { // check for adequate permissions
            try {
                console.log('Insufficient permissions. Stopping execution.')
                return await message.reply('sorry, you need to have the `MANAGE_CHANNELS` permission to use this command.');
            } catch (e) {
                console.log(`There was an error sending a message in the guild ${message.guild}! The error message is below:`);
                console.log(e);
                return;
            }
        }

        if (!args || args.length === 0 || args.length > 3) { // check if the args exist (this function requires them) and that there are not too many args
            try {
                console.log('Incorrect syntax given. Stopping execution.');
                return await message.channel.send(`Incorrect syntax! Correct syntax: \`${this.syntax}\``)
            } catch (e) {
                console.log(`There was an error sending a message in the guild ${message.guild}! The error message is below:`);
                console.log(e);
                return;
            }
        }

        const channelName = args.shift()!.replace(/_/g, ' '); // get the channel name and replace all underscores with spaces
        const type = args.shift(); // get the potential type
        const permission = args.shift(); // get the potential permission

        if (permission) { // if there is a permission, meaning there will be a type and a channelName as well
            console.log('Permission detected. Attempting to create channel with type and permission.');

            const permissionFormatted = permission.toLowerCase(); // lowercase the permission for consistent formatting

            if (permissionFormatted !== 'public' && permissionFormatted !== 'private') { // check if the permission given was valid
                try {
                    console.log('Permission supplied was invalid. Stopping execution.');
                    return await message.channel.send('Invalid value for permission! Must be public or private.')
                } catch (e) {
                    console.log(`There was an error sending a message in the guild ${message.guild}! The error message is below:`);
                    console.log(e);
                    return;
                }
            }

            const typeFormatted = type!.toLowerCase(); // lowercase the type for consistent formatting

            if (typeFormatted !== 'text' && typeFormatted !== 'voice') { // check if the type given was valid
                try {
                    console.log('Type supplied was invalid. Stopping execution.');
                    return await message.channel.send('Invalid value for type! Must be text or voice.')
                } catch (e) {
                    console.log(`There was an error sending a message in the guild ${message.guild}! The error message is below:`);
                    console.log(e);
                    return;
                }
            }

            if (getRoleFromMention(message, channelName) || getUserFromMention(message, channelName) || getChannelFromMention(message, channelName) || message.guild!.channels.cache.find(c => c.name === channelName && c.type === typeFormatted)) { // checking to see if the channel already exists on the server as a role or anything else
                console.log('Invalid channel name or channel already exists in server. Stopping execution.');
                outputEmbed.addField(`${channelName}`, 'Invalid channel name or channel already exists on this server.');
                outputEmbed.setDescription(`**Command executed by:** ${message.member!.user.tag}`);
                try { // send output embed with information about the command's success
                    return await message.channel.send(outputEmbed);
                } catch (e) {
                    console.log(`There was an error sending an embed in the guild ${message.guild}! The error message is below:`);
                    console.log(e);
                    return;
                }
            }

            if (permissionFormatted === 'private') { // if the permission specified is private
                try {
                    const channel = await message.guild!.channels.create(channelName, { // create a channel with the given options (private)
                        type: typeFormatted,
                        permissionOverwrites: [
                            {
                                id: message.guild!.roles.everyone.id,
                                deny: ['VIEW_CHANNEL']
                            }
                        ]
                    });
                    outputEmbed.addField(`Status`, 'Success');
                    outputEmbed.addField('Type', `${channel.type.replace(/^\w/, (c) => c.toUpperCase())}`);
                    outputEmbed.addField('Permission', 'Private');
                }
                catch (e) {
                    outputEmbed.addField(`Status`, 'Failed');
                    console.log(`Failed to create channel ${channelName} in server ${message.guild!.name}.`)
                }

            } else { // else if it is public
                try {
                    const channel = await message.guild!.channels.create(channelName, { // create a channel with the given options (public)
                        type: typeFormatted,
                    });
                    outputEmbed.addField(`Status`, 'Success');
                    outputEmbed.addField('Type', `${channel.type.replace(/^\w/, (c) => c.toUpperCase())}`);
                    outputEmbed.addField('Permission', 'Public');
                }
                catch (e) {
                    outputEmbed.addField(`Status`, 'Failed');
                    console.log(`Failed to create channel ${channelName} in server ${message.guild!.name}.`)
                }
            }
        } else if (type) { // if there is not a permission, check if there is a type given
            console.log('Type detected. Attempting to create channel with type.');

            const typeFormatted = type!.toLowerCase(); // lowercase the type for consistent formatting

            if (typeFormatted !== 'text' && typeFormatted !== 'voice') { // check if the type given was valid
                try {
                    console.log('Type supplied was invalid. Stopping execution.');
                    return await message.channel.send('Invalid value for type! Must be text or voice.')
                } catch (e) {
                    console.log(`There was an error sending a message in the guild ${message.guild}! The error message is below:`);
                    console.log(e);
                    return;
                }
            }

            if (getRoleFromMention(message, channelName) || getUserFromMention(message, channelName) || getChannelFromMention(message, channelName) || message.guild!.channels.cache.find(c => c.name === channelName && c.type === typeFormatted)) { // checking to see if the channel already exists on the server as a role or anything else
                console.log('Invalid channel name or channel already exists in server. Stopping execution.');
                outputEmbed.addField(`${channelName}`, 'Invalid channel name or channel already exists on this server.');
                outputEmbed.setDescription(`**Command executed by:** ${message.member!.user.tag}`);
                try { // send output embed with information about the command's success
                    return await message.channel.send(outputEmbed);
                } catch (e) {
                    console.log(`There was an error sending an embed in the guild ${message.guild}! The error message is below:`);
                    console.log(e);
                    return;
                }
            }

            try {
                const channel = await message.guild!.channels.create(channelName, { // create a channel with the given options (private)
                    type: typeFormatted,
                });
                outputEmbed.addField(`Status`, 'Success');
                outputEmbed.addField('Type', `${channel.type.replace(/^\w/, (c) => c.toUpperCase())}`);
                outputEmbed.addField('Permission', 'Public');
            }
            catch (e) {
                outputEmbed.addField(`Status`, 'Failed');
                console.log(`Failed to create channel ${channelName} in server ${message.guild!.name}.`)
            }

        } else { // if there is no type or permission specified
            console.log('No permission or type detected. Creating channel with default settings.');

            if (getRoleFromMention(message, channelName) || getUserFromMention(message, channelName) || getChannelFromMention(message, channelName) || message.guild!.channels.cache.find(c => c.name === channelName)) { // checking to see if the channel already exists on the server as a role or anything else
                console.log('Invalid channel name or channel already exists in server. Stopping execution.');
                outputEmbed.addField(`${channelName}`, 'Invalid channel name or channel already exists on this server.');
                outputEmbed.setDescription(`**Command executed by:** ${message.member!.user.tag}`);
                try { // send output embed with information about the command's success
                    return await message.channel.send(outputEmbed);
                } catch (e) {
                    console.log(`There was an error sending an embed in the guild ${message.guild}! The error message is below:`);
                    console.log(e);
                    return;
                }
            }

            try {
                await message.guild!.channels.create(channelName);  // create a channel with the defualt options 

                outputEmbed.addField(`Status`, 'Success');
                outputEmbed.addField('Type', 'Text');
                outputEmbed.addField('Permission', 'Public');
            }
            catch (e) {
                outputEmbed.addField(`Status`, 'Failed');
                console.log(`Failed to create channel ${channelName} in server ${message.guild!.name}.`)
            }
        }

        try { // send output embed with information about the command's success
            if (outputEmbed.fields.length > 0) { // check if there are actually any fields to send the embed with
                outputEmbed.setDescription(`**Command executed by:** ${message.member!.user.tag}\n**Channel created:** ${channelName}`);
                await message.channel.send(outputEmbed);
            }
            console.log(`Command createchannel, started by ${message.member!.user.tag}, terminated successfully in ${message.guild}.`);
        } catch (e) {
            console.log(`There was an error sending an embed in the guild ${message.guild}! The error message is below:`);
            console.log(e);
        }
    }
}

export = command; // export the command to the main module
