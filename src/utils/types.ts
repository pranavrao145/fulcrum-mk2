import {Message} from 'discord.js';
import {Client} from 'pg';

// interface for a bot command
export interface ICommand {
    name: string
    description: string
    alias?: string[]
    syntax: string
    admin: boolean,
    execute(message: Message, _con: Client, args?: string[]): any
}
