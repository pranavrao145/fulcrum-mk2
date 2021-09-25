import { Message } from 'discord.js';
import { Client } from 'pg';

// interface for a bot command
export interface ICommand {
    name: string
    description: string
    alias?: string[]
    syntax: string
    execute(message: Message, _con: Client, args?: string[]): any
}

export interface ICommand {
    name: string
    description: string
    alias?: string[]
    syntax: string
    execute(message: Message | any, _con: Client, args?: string[]): any
}

