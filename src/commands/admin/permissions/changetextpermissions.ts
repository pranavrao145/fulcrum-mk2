import {Message, MessageEmbed} from 'discord.js';
import {ICommand} from '../../../utils/types';
import {Client} from 'pg';
import {getRoleFromMention, timeout} from '../../../utils/helpers';
import {rolePermissions} from '../../../utils/information';

const command: ICommand = {
    name: 'changetextpermissions',
    description: 'Changes the given role\'s permissions in a text channel according to the changes given. Permissions are referred to by their number (see f!listpermissions). You can change permissions by specifiying an operation and a permission number. Operation can be + for add, - for remove, or just r (with nothing after) for resetting permissions. E.g. to allow CREATE_INSTANT_INVITE and MANAGE_MESSAGES on a role for a certain text channel, simply give the command: f!changetextpermissions @role #text-channel +1 +7',
    alias: ['cp', 'cgp'],
    syntax: 'f!changetextpermissions [role mention or number] [text channel mention] [permission changes, (+/-/r)(permission number)]',
    async execute(message: Message, _con: Client, args?: string[]) {
        console.log(`Command changetextpermissions started by user ${message.member!.user.tag} in guild ${message.guild!.name}.`);

    }
}
