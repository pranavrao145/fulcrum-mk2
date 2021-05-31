import { Message } from "discord.js";
import { Client } from 'pg';

export interface Command {
    name: string
    description: string
    alias?: string[]
    execute(message: Message, con: Client, args?: string[]): any
}
