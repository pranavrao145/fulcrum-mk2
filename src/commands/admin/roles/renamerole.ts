import {Message, MessageEmbed} from 'discord.js';
import {ICommand} from '../../../utils/types';
import {Client} from 'pg';
import {getRoleFromMention} from '../../../utils/helpers';

const command: ICommand = {
    name: 'renamerole',
    description: 'Renames the given role to the new name specified.',
    alias: ['rnr'],
    syntax: 'f!renamerole [role mention or number] [new name (underscores for spaces)]',
    async execute(message: Message, _con: Client, args?: string[]) {
        console.log(`Command renamerole started by user ${message.member!.user.tag} in guild ${message.guild!.name}.`);

        let outputEmbed = new MessageEmbed() // create an embed to display the results of the command
            .setColor('#FFFCF4')
            .setTitle('Rename Role - Report')

        if (!message.member!.hasPermission('MANAGE_ROLES')) { // check for adequate permissions
            try {
                console.log('Insufficient permissions. Stopping execution.')
                return await message.reply('sorry, you need to have the `MANAGE_ROLES` permission to use this command.');
            } catch (e) {
                console.log(`There was an error sending a message in the guild ${message.guild!.name}! The error message is below:`);
                console.log(e);
                return;
            }
        }

        if (!args || args.length < 2) { // check if the args exist (this function requires them) and that there are not too many args
            try {
                console.log('Incorrect syntax given. Stopping execution.');
                return await message.channel.send(`Incorrect syntax. Correct syntax: \`${this.syntax}\``)
            } catch (e) {
                console.log(`There was an error sending a message in the guild ${message.guild!.name}! The error message is below:`);
                console.log(e);
                return;
            }
        }

        const roleMention = args!.shift(); // find the mention of the role numbers in the args
        const newName = args.shift()!.replace(/_/g, ' '); // get the new name for the role and replace all underscores with spaces
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
                return await message.channel.send('Invalid role.');
            } catch (e) {
                console.log(`There was an error sending a message in the guild ${message.guild!.name}! The error message is below:`);
                console.log(e);
                return;
            }
        }

        try {
            const oldName = role.name; // take note of the old name of the role (for output purposes)
            const newRole = await role.setName(newName); // rename the role
            outputEmbed.addField('Status', 'Success');
            outputEmbed.addField('New Name', `${newRole.name}`);
            console.log(`Role ${oldName} renamed successfully to ${newRole.name}.`);
            outputEmbed.setDescription(`**Command executed by:** ${message.member!.user.tag}\n**Role renamed:** ${oldName}`);
        } catch (e) {
            console.log(`Failed to rename role ${role.name}.`)
            outputEmbed.addField('Status', 'Failed');
        }

        try { // send output embed with information about the command's success
            if (outputEmbed.fields.length > 0) { // check if there are actually any fields to send the embed with
                await message.channel.send(outputEmbed);
            }
            console.log(`Command renamerole, started by ${message.member!.user.tag}, terminated successfully in ${message.guild!.name}.`);
        } catch (e) {
            console.log(`There was an error sending an embed in the guild ${message.guild!.name}! The error message is below:`);
            console.log(e);
        }
    }
}

export = command; // export the command to the main module
