import {Message, MessageEmbed} from 'discord.js';
import {ICommand} from '../../../utils/types';
import {Client} from 'pg';
import {getRoleFromMention, timeout} from '../../../utils/helpers';

const command: ICommand = {
    name: 'clearroles',
    description: 'Removes the given role from all users that have it.',
    alias: ['clr'],
    syntax: 'f!clearroles [role mentions or numbers (10 max)]',
    async execute(message: Message, _con: Client, args?: string[]) {
        console.log(`Command clearroles started by user ${message.member!.user.tag} in guild ${message.guild!.name}.`);

        let outputEmbed = new MessageEmbed() // create an embed to display the results of the command
            .setColor('#FFFCF4')
            .setTitle('Clear Roles - Report')

        let outputEmbedText: string = ''; // text that will eventually be sent as a field in outputEmbed. Mainly for formatting

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

        if (!args || args.length === 0 || args.length < 1 || args.length > 10) { // check if the args exist (this function requires them) and that there are not too many args
            try {
                console.log('Incorrect syntax given. Stopping execution.');
                return await message.channel.send(`Incorrect syntax! Correct syntax: \`${this.syntax}\``)
            } catch (e) {
                console.log(`There was an error sending a message in the guild ${message.guild}! The error message is below:`);
                console.log(e);
                return;
            }
        }

        for (const mention of args!) {
            let overallSuccess = true; // var to keep track of whether the clear of this role was successful or not

            let role; // declare role object, to be determined later using logic below

            if (isNaN(parseInt(mention))) { // if the arg is a mention and not a number
                console.log('Role is of type mention. Getting role from role cache.')
                role = getRoleFromMention(message, mention); // then get it from the role cache
            } else {
                console.log('Role is of type number. Getting role using position.')
                role = message.guild!.roles.cache.get(message.guild!.roles.cache.map(r => r.id)[parseInt(mention) - 1]); // else find the role by its position number
            }

            if (!role) { // check if the role actually exists
                console.log('A role supplied was not valid. Skipping over it.');
                outputEmbedText += `\n**${mention}:** Invalid role or role not found`;
                continue;
            }

            const members = role.members.values(); // get the members of the role

            if (!members) { // check if the role members actually exist
                console.log('A role supplied did not have any members. Skipping over it.');
                outputEmbedText += `\n**${role.name}:** No members with this role were found.`;
                continue;
            }

            for (const member of members) { // iterate through the members that have the role
                if (!member) {
                    console.log('A member with the role did not exists. Skipping over them.');
                    overallSuccess = false; // if a member for a role does not exists, the function has failed to remove the role for all members
                    continue;
                }

                try {
                    await timeout(300);
                    await member.roles.remove(role);
                    console.log(`Role ${role.name} was removed from user ${member.user.tag} successfully.`);
                } catch (e) {
                    console.log(`Failed to remove ${role.name} from ${member.user.tag}.`)
                    overallSuccess = false; // the function has failed to remove the role for all members, so not successful
                }
            }

            if (overallSuccess) { // check if the command was successful and add the according message
                console.log(`Role ${role!.name} was cleared successfully.`)
                outputEmbedText += `\n**${role!.name}:** Role cleared successfully.`;
            } else {
                console.log(`Failed to clear role ${role!.name}.`);
                outputEmbedText += `\n**${role!.name}:** Couldn't clear role fully.`;
            }
        }

        try { // send output embed with information about the command's success
            outputEmbed.addField('\u200B', outputEmbedText); // add whatever text was accumulated throughout the command to the embed
            if (outputEmbedText !== '') { // check if there is actually any text to send the embed with
                outputEmbed.setDescription(`**Command executed by:** ${message.member!.user.tag}`);
                await message.channel.send(outputEmbed);
            }
            console.log(`Command clearroles, started by ${message.member!.user.tag}, terminated successfully in ${message.guild}.`);
        } catch (e) {
            console.log(`There was an error sending an embed in the guild ${message.guild}! The error message is below:`);
            console.log(e);
        }

    }
}

export = command; // export the command to the main module
