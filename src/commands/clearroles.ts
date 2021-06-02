import { Message, MessageEmbed } from "discord.js";
import { ICommand } from '../utils/types';
import { Client } from 'pg';
import { getRoleFromMention, timeout } from "../utils/helpers";

const command: ICommand = {
    name: 'clearroles',
    description: 'Removes the given role from all users that have it.',
    alias: ['clr'],
    syntax: 'f!clearroles [role mentions (10 max)]',
    async execute(message: Message, con: Client, args?: string[]) {
        console.log(`Command clearroles started by user ${message.member!.user.tag} in guild ${message.guild!.name}.`);

        let outputEmbed = new MessageEmbed() // create an embed to display the results of the command
        .setColor('#FFFCF4')
        .setTitle('Assign Roles - Report')

        if (!message.member!.hasPermission('MANAGE_ROLES')) { // check for adequate permissions
            console.log('Checking permissions...')
            try {
                console.log('Insufficient permissions, stopping execution.')
                return await message.reply('sorry, you need to have the MANAGE_ROLES permission to use this command.');
            } catch (e) {
                console.log(`There was an error sending a message in the guild ${message.guild}! The error message is below:`);
                console.log(e);
            }
        }

        if (!args || args.length < 1 || args.length > 10) { // check if the args exist (this function requires them) and that there are not too many args
            console.log('Checking validity of arguments...')
            try {
                console.log('Incorrect syntax given, stopping execution.');
                return await message.channel.send(`Incorrect syntax! Correct syntax: ${this.syntax}`)
            } catch (e) {
                console.log(`There was an error sending a message in the guild ${message.guild}! The error message is below:`);
                console.log(e);
            }
        }

        for (const mention of args!) {
            let overallSuccess = true; // var to keep track of whether the clear of this role was successful or not

            const role = getRoleFromMention(message, mention); // get role from the guild role cache

            if (!role) { // check if the role actually exists
                console.log('A role supplied was not valid. Skipping over it.');
                outputEmbed.addField(`${mention}`, 'Invalid role or role not found.');
                continue;
            }

            const memberIDs = role.members.map(mem => mem.id); // get the mmebers of the role

            if (!memberIDs) { // check if the role members actually exist
                console.log('A role supplied did not have any members. Skipping over it.');
                outputEmbed.addField(`${role.name}`, 'No members with this role were found.');
                continue;
            }


            for (const memberID of memberIDs) { // iterate through the members that have the role
                const member = message.guild!.members.cache.get(memberID); // get the member 

                if (!member) {
                    console.log('A member with the role did not exists. Skipping over them.');
                    overallSuccess = false; // if a member for a role does not exists, the function has failed to remove the role for all members
                    continue;
                }

                try {
                    await timeout(500);
                    await member.roles.remove(role);
                    console.log(`Role ${role.name} was removed from user ${member.user.tag} successfully.`);
                } catch (e) {
                    console.log(`Failed to remove ${role.name} from ${member.user.tag}.`)
                    overallSuccess = false; // the function has failed to remove the role for all members, so not successful
                }
            }

            if (overallSuccess) { // check if the command was successful and add the according message
                console.log(`Role ${role!.name} was cleared successfully.`)
                outputEmbed.addField(`${role!.name}`, 'Role cleared successfully.');
            } else {
                console.log(`Failed to clear role ${role!.name}.`);
                outputEmbed.addField(`${role!.name}`, 'Couldn\'t clear role fully.');
            }
        }

        try { // send output embed with information about the command's success
            if (outputEmbed.fields.length > 0) { // check if there are actually any fields to send the embed with
                outputEmbed.setDescription(`Command executed by: ${message.member!.user.tag}`);
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
