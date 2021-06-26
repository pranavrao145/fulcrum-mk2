import {Message, MessageEmbed} from 'discord.js';
import {ICommand} from '../../../utils/types';
import {Client} from 'pg';
import {getRoleFromMention, getUserFromMention, timeout} from '../../../utils/helpers';

const command: ICommand = {
    name: 'changerolepermissions',
    description: 'Changes the given role\'s permissions on the entire server according to the changes given. Permissions are changed to by their number (see f!listpermissions) and a prefix. E.g. to allow CREATE_INSTANT_INVITE on a role, simply give the command: f!changerolepermissions @role +1',
    alias: ['cp', 'crp'],
    syntax: 'f!changerolepermissions [role mention or number] [permission changes, (+/-)(permission number)]',
    async execute(message: Message, _con: Client, args?: string[]) {
        console.log(`Command changerolepermissions started by user ${message.member!.user.tag} in guild ${message.guild!.name}.`);
        
        if (!message.member!.hasPermission('MANAGE_ROLES')) { // check for adequate permissions
            try {
                console.log('Insufficient permissions. Stopping execution.')
                return await message.reply('sorry, you need to have the `MANAGE_ROLES` permission to use this command.');
            } catch (e) {
                console.log(`There was an error sending a message in the guild ${message.guild}! The error message is below:`);
                console.log(e);
                return;
            }
        }

        if (!args || args.length < 2) { // check if the args exist (this function requires them) and that there are not too many args
            try {
                console.log('Incorrect syntax given. Stopping execution.');
                return await message.channel.send(`Incorrect syntax! Correct syntax: \`${this.syntax}\``)
            } catch (e) {
                console.log(`There was an error sending a message in the guild ${message.guild}! The error message is below:`);
                console.log(e);
                return;
            }
        }

        const roleMention = args.shift(); // get the role mention from the args
        const role = getRoleFromMention(message, roleMention!) // get the actual role


    }
}
