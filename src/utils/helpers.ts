import { Channel, GuildMember, Message, Role } from 'discord.js'

export function getRoleFromMention(message: Message, mention: string): Role | undefined {
    if (mention.startsWith('<@') && mention.endsWith('>')) {
        mention = mention.slice(2, -1);

        if (mention.startsWith('&')) {
            mention = mention.slice(1);
        }

        return message.guild!.roles.cache.get(mention);
    }
}

export function getUserFromMention(message: Message, mention: string): GuildMember | undefined {
    if (mention.startsWith('<@') && mention.endsWith('>')) {
        mention = mention.slice(2, -1);

        if (mention.startsWith('!')) {
            mention = mention.slice(1);
        }

        return message.guild!.members.cache.get(mention);
    }
}

export function getChannelFromMention(message: Message, mention: string): Channel | undefined {
    if (!mention) return;

    if (mention.startsWith('<#') && mention.endsWith('>')) {
        mention = mention.slice(2, -1);

        return message.guild!.channels.cache.get(mention);
    }
}

export function timeout(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function getRandomInteger(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function isValidColor(color: string) {
    return /^#([0-9A-F]{3}){1,2}$/i.test(color);
}

