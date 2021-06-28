import {Message, MessageEmbed} from 'discord.js';
import {ICommand} from '../../../utils/types';
import {Client} from 'pg';
import {getChannelFromMention, getRoleFromMention, timeout} from '../../../utils/helpers';
import {generalPermissions} from '../../../utils/information';

const command: ICommand = {
    name: 'changetextpermissions',
    description: 'Changes the given role\'s permissions in a text channel according to the changes given. Permissions are referred to by their number (see f!listpermissions). You can change permissions by specifiying an operation and a permission number. Operation can be + for add, - for remove, or just r (with nothing after) for resetting permissions. E.g. to allow CREATE_INSTANT_INVITE and MANAGE_MESSAGES on a role for a certain text channel, simply give the command: f!changetextpermissions @role #text-channel +1 +7',
    alias: ['cp', 'cgp'],
    syntax: 'f!changetextpermissions [role mention or number] [text channel mention] [permission changes, (+/-/r)(permission number)]',
    async execute(message: Message, _con: Client, args?: string[]) {
        console.log(`Command changetextpermissions started by user ${message.member!.user.tag} in guild ${message.guild!.name}.`);

        const outputEmbed = new MessageEmbed() // create a new embed for output
            .setColor('#FFFCF4')
            .setTitle('Change General Permissions - Report');

        let outputEmbedText = '';

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

        if (!args || args.length < 3) { // check if the args exist (this function requires them) and that there are not too many args
            try {
                console.log('Incorrect syntax given. Stopping execution.');
                return await message.channel.send(`Incorrect syntax! Correct syntax: \`${this.syntax}\``)
            } catch (e) {
                console.log(`There was an error sending a message in the guild ${message.guild}! The error message is below:`);
                console.log(e);
                return;
            }
        }

        const roleMention = args.shift(); // get the role mention 
        const channelMention = args.shift(); // get the channel mention

        const role = getRoleFromMention(message, roleMention!);

        if (!role) { // check if the role supplied was valid 
            console.log('Role supplied was invalid. Stopping execution.');
            try {
                return await message.channel.send('Invalid role!');
            } catch (e) {
                console.log(`There was an error sending a message in the guild ${message.guild}! The error message is below:`);
                console.log(e);
                return;
            }
        }
        
        const textChannel = getChannelFromMention(message, channelMention!); // attempt to get a channel from the mention

        if (!textChannel) { // check if the role supplied was valid 
            console.log('Text channel supplied was invalid. Stopping execution.');
            try {
                return await message.channel.send('Invalid text channel!');
            } catch (e) {
                console.log(`There was an error sending a message in the guild ${message.guild}! The error message is below:`);
                console.log(e);
                return;
            }
        }

    }
}
