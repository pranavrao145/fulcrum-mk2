import {Message, MessageEmbed, PermissionString} from 'discord.js';
import {ICommand} from '../../utils/types';
import {Client} from 'pg';
import {rolePermissions} from '../../utils/information';

const command: ICommand = {
    name: 'listpermissions',
    description: 'Lists permissions and their associated numbers with to use with permission changing commands.',
    alias: ['lp'],
    syntax: 'f!listpermissions (type, role/text/voice, default role)',
    async execute(message: Message, _con: Client, args?: string[]) {
        console.log(`Command listpermissions started by user ${message.member!.user.tag} in guild ${message.guild!.name}.`);

        const outputEmbed = new MessageEmbed() // create a new embed for output
        .setColor('#FFFCF4')
        .setTitle(`Permissions`);

       let outputEmbedText = '';

        if (!args || args.length === 0 || args.length > 1) { // check if the args exist (this function requires them) and that there are not too many args
            try {
                console.log('Incorrect syntax given. Stopping execution.');
                return await message.channel.send(`Incorrect syntax! correct syntax: \`${this.syntax}\``)
            } catch (e) {
                console.log(`There was an error sending a message in the guild ${message.guild}! The error message is below:`);
                console.log(e);
                return;
            }
        }

        let type = args.shift()!.toLowerCase(); // get the type specified by the user

        if (!type) { 
            console.log('No type given by user. Assuming role.');
            type = 'role'; // set type to role explicitly so program knows what to do
        } else {
            console.log(`Type detected. Attempting to print permission of type ${type}.`);
        }

        switch (type) { // check different values of type
            case 'role': 
                    break;
            case 'text':
                break;
            case 'voice':
                break;
            default: // if the type matches no valid options
                break;

        }

    }
}
