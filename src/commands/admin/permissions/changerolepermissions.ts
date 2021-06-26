import {Message, MessageEmbed} from 'discord.js';
import {ICommand} from '../../../utils/types';
import {Client} from 'pg';
import {getRoleFromMention, getUserFromMention, timeout} from '../../../utils/helpers';
import {rolePermissions} from '../../../utils/information';

const command: ICommand = {
    name: 'changerolepermissions',
    description: 'Changes the given role\'s permissions on the entire server according to the changes given. Permissions are changed to by their number (see f!listpermissions) and a prefix. E.g. to allow CREATE_INSTANT_INVITE on a role, simply give the command: f!changerolepermissions @role +1',
    alias: ['cp', 'crp'],
    syntax: 'f!changerolepermissions [role mention or number] [permission changes, (+/-/r)(permission number)]',
    async execute(message: Message, _con: Client, args?: string[]) {
        console.log(`Command changerolepermissions started by user ${message.member!.user.tag} in guild ${message.guild!.name}.`);
        
        const outputEmbed = new MessageEmbed() // create a new embed for output
        .setColor('#FFFCF4')
        .setTitle(`Roles for ${message.guild!.name}`);

        let outputEmbedText = '';

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

        const roleMention = args!.shift(); // find the mention of the role numbers in the args
        let role; // declare role object, to be determined later using logic below

        if (isNaN(parseInt(roleMention!))) { // if the arg is a mention and not a number
            console.log('Role is of type mention. Getting role from role cache.')
            role = getRoleFromMention(message, roleMention!); // then get it from the role cache
        } else {
            console.log('Role is of type number. Getting role using position.')
            role = message.guild!.roles.cache.get(message.guild!.roles.cache.map(r => r.id)[parseInt(roleMention!) - 1]); // else find the role by its position number
        }

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

        for (const permissionChange of args) { // iterate through the rest of the args to calculate and apply the permission changes
            const operation = permissionChange.charAt(0); // get the operation (first character of the sequence)
            const permissionToChange = permissionChange.slice(1); // slice the operation off the argument to get the permission number

            if (!(operation === '+' || operation === '-' || operation === 'r')) {
                console.log(`Invalid operation was given for a permission change. Skipping over it.`);
                outputEmbedText += `**${permissionChange}:** Invalid operation`;
                continue;
            }

            
            console.log('Attempting to find permission number in role permissions.')
            const permissionNum = parseInt(permissionChange, 10)

            if (isNaN(permissionNum)) { // check if the value for the permission is actually a number
                console.log(`Invalid operation was given for a permission change. Skipping over it.`);
                outputEmbedText += `**${permissionChange}:** Invalid permission.\n`;
                continue;
            }

            if (permissionNum < 1 || permissionNum > rolePermissions.length + 1) { // check if the value for permission is actually within the range of the role permissions
                console.log(`Invalid operation was given for a permission change. Skipping over it.`);
                outputEmbedText += `**${permissionChange}:** Invalid permission.\n`;
                continue;
            }
            
            const permission = rolePermissions[permissionNum]; // get the permission name from the list

            switch (operation) { // do different things depending on the operation
                case '+':
                    role.permissions.add();
                    break;
                case '-':
                    break;
                case 'r':
                    break;
                default:
                    break;

            }

        }

    }
}
