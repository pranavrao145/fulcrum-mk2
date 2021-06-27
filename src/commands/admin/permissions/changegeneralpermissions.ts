import {Message, MessageEmbed} from 'discord.js';
import {ICommand} from '../../../utils/types';
import {Client} from 'pg';
import {getRoleFromMention, timeout} from '../../../utils/helpers';
import {rolePermissions} from '../../../utils/information';

const command: ICommand = {
    name: 'changegeneralpermissions',
    description: 'Changes the given role\'s permissions on the entire server according to the changes given. Permissions are referred to by their number (see f!listpermissions). You can change permissions by specifiying an operation and a permission number. Operation can be + for add, - for remove, or just r (with nothing after) for resetting permissions. E.g. to allow CREATE_INSTANT_INVITE and ADMINISTRATOR on a role, simply give the command: f!changegeneralpermissions @role +1 +4',
    alias: ['cp', 'cgp'],
    syntax: 'f!changegeneralpermissions [role mention or number] [permission changes, (+/-/r)(permission number)]',
    async execute(message: Message, _con: Client, args?: string[]) {
        console.log(`Command changegeneralpermissions started by user ${message.member!.user.tag} in guild ${message.guild!.name}.`);

        const outputEmbed = new MessageEmbed() // create a new embed for output
            .setColor('#FFFCF4')
            .setTitle('Change General Permissions - Report');

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

            if (operation !== 'r') { // if the operation is not reset, it is add or remove
                console.log('Operation is not reset.');
                console.log('Attempting to find permission number in role permissions.')
                const permissionNum = parseInt(permissionToChange, 10);

                if (isNaN(permissionNum)) { // check if the value for the permission is actually a number
                    console.log(`Invalid permission was given for a permission change. Skipping over it.`);
                    outputEmbedText += `**${permissionChange}:** Invalid permission.\n`;
                    continue;
                }

                if (permissionNum < 1 || permissionNum > rolePermissions.length + 1) { // check if the value for permission is actually within the range of the role permissions
                    console.log(`Invalid permission was given for a permission change. Skipping over it.`);
                    outputEmbedText += `**${permissionChange}:** Invalid permission.\n`;
                    continue;
                }

                const permission = rolePermissions[permissionNum - 1]; // get the permission name from the list

                const currentPermissions = role.permissions // get the role's current permissions
                let newPermissions; // empty variable to hold the new permissions

                switch (operation) { // do different things depending on the operation
                    case '+':
                        newPermissions = currentPermissions.add([permission]); // add the new permissions
                        try {
                            await timeout(300); // setting a short timeout to prevent abuse of Discord's API
                            await role.setPermissions(newPermissions.bitfield); // set the permissions of the role as the new permissions
                            console.log(`Successfully added permission ${permission.toString()} to role ${role.name}.`);
                            outputEmbedText += `**${permission}**: Permission added successfully\n`
                        } catch (e) {
                            console.log(`Failed to add permission ${permission.toString()} to role ${role.name}.`);
                            outputEmbedText += `**${permission}**: Failed to add permission\n`
                        }
                        break;
                    case '-':
                        newPermissions = currentPermissions.remove([permission]); // remove the new permissions
                        try {
                            await timeout(300); // setting a short timeout to prevent abuse of Discord's API
                            await role.setPermissions(newPermissions.bitfield); // set the permissions of the role as the new permissions
                            console.log(`Successfully removed permission ${permission.toString()} from role ${role.name}.`);
                            outputEmbedText += `**${permission}**: Permission removed successfully\n`
                        } catch (e) {
                            console.log(`Failed to remove permission ${permission.toString()} from role ${role.name}.`);
                            outputEmbedText += `**${permission}**: Failed to remove permission\n`
                        }
                        break;
                    default:
                        console.log(`Invalid operation was given for a permission change. Skipping over it.`);
                        outputEmbedText += `**${permissionChange}:** Invalid operation`;
                        break;
                }
            } else { // if the operation is reset
                console.log('Operation is reset.')
                try {
                    await timeout(300); // setting a short timeout to prevent abuse of Discord's API
                    await role.setPermissions(0); // wipe all permissions from the role
                    console.log(`Successfully reset permissions on role ${role.name}.`);
                    outputEmbedText += `**RESET PERMISSIONS**: Permissions reset successfully\n`
                } catch (e) {
                    console.log(`Failed to reset permissions on role ${role.name}.`);
                    outputEmbedText += `**RESET PERMISSIONS**: Failed to reset permissions\n`
                }
                break;
            }


        }

        try { // send output embed with information about the command's success
            outputEmbed.addField('\u200B', outputEmbedText); // add whatever text was accumulated throughout the command to the embed
            if (outputEmbedText !== '') { // check if there is actually any text to send the embed with
                outputEmbed.setDescription(`**Command executed by:** ${message.member!.user.tag}\n**Modified perimssions of role:** ${role.name}`);
                await message.channel.send(outputEmbed);
            }
            console.log(`Command changegeneralpermissions, started by ${message.member!.user.tag}, terminated successfully in ${message.guild}.`);
        } catch (e) {
            console.log(`There was an error sending an embed in the guild ${message.guild}! The error message is below:`);
            console.log(e);
        }
    }
}

export = command; // export the command to the main module

