import { Message } from 'discord.js';
import { Command } from '../utils/types';
import { Client } from 'pg';

const command: Command = {
    name: 'assignrole',
    description: 'Adds the given role to the given user(s).',
    alias: ['ar'],
    async execute(message: Message, con?: Client, args?: string[]) {
    
    }
}

