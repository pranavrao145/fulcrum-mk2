import {PermissionResolvable} from "discord.js";

export const monthsList = [
    'Jan',
    'Feb', 
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
];

export const daysList = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
];

export const generalPermissions: PermissionResolvable[] = [ // list of permissions for roles (in general) on the server
    'CREATE_INSTANT_INVITE',
    'KICK_MEMBERS',
    'BAN_MEMBERS',
    'ADMINISTRATOR',
    'MANAGE_CHANNELS',
    'MANAGE_GUILD',
    'ADD_REACTIONS',
    'VIEW_AUDIT_LOG',
    'PRIORITY_SPEAKER',
    'STREAM',
    'VIEW_CHANNEL',
    'SEND_MESSAGES',
    'SEND_TTS_MESSAGES',
    'MANAGE_MESSAGES',
    'EMBED_LINKS',
    'ATTACH_FILES',
    'READ_MESSAGE_HISTORY',
    'MENTION_EVERYONE',
    'USE_EXTERNAL_EMOJIS',
    'VIEW_GUILD_INSIGHTS',
    'CONNECT',
    'SPEAK',
    'MUTE_MEMBERS',
    'DEAFEN_MEMBERS',
    'MOVE_MEMBERS',
    'USE_VAD',
    'CHANGE_NICKNAME',
    'MANAGE_NICKNAMES',
    'MANAGE_ROLES',
    'MANAGE_WEBHOOKS',
    'MANAGE_EMOJIS',
]
export const voiceChannelPermissions: PermissionResolvable[] = [ // list of permission overwrites for voice channels
    'CREATE_INSTANT_INVITE',
    'MANAGE_CHANNELS',
    'PRIORITY_SPEAKER',
    'STREAM',
    'VIEW_CHANNEL',
    'CONNECT',
    'SPEAK',
    'MUTE_MEMBERS',
    'DEAFEN_MEMBERS',
    'MOVE_MEMBERS',
    'USE_VAD',
    'MANAGE_ROLES',
]

export const textChannelPermissions: PermissionResolvable[] = [ // list of permissions for text channels
    'CREATE_INSTANT_INVITE',
    'MANAGE_CHANNELS',
    'ADD_REACTIONS',
    'VIEW_CHANNEL',
    'SEND_MESSAGES',
    'SEND_TTS_MESSAGES',
    'MANAGE_MESSAGES',
    'EMBED_LINKS',
    'ATTACH_FILES',
    'READ_MESSAGE_HISTORY',
    'MENTION_EVERYONE',
    'USE_EXTERNAL_EMOJIS',
    'MANAGE_ROLES',
    'MANAGE_WEBHOOKS',
]

export const textChannelPermissionsEnable: Map<PermissionResolvable, any> = new Map([ // list of permissions for text channels with the corresponding permission overwrites to enable them
    ['CREATE_INSTANT_INVITE', { CREATE_INSTANT_INVITE: true }],
    ['MANAGE_CHANNELS', { MANAGE_CHANNELS: true }],
    ['ADD_REACTIONS', { ADD_REACTIONS: true }],
    ['VIEW_CHANNEL', { VIEW_CHANNEL: true }],
    ['SEND_MESSAGES', { SEND_MESSAGES: true }],
    ['SEND_TTS_MESSAGES', { SEND_TTS_MESSAGES: true }],
    ['MANAGE_MESSAGES', { MANAGE_MESSAGES: true }],
    ['EMBED_LINKS', { EMBED_LINKS: true }],
    ['ATTACH_FILES', { ATTACH_FILES: true }],
    ['READ_MESSAGE_HISTORY', { READ_MESSAGE_HISTORY: true }],
    ['MENTION_EVERYONE', { MENTION_EVERYONE: true }],
    ['USE_EXTERNAL_EMOJIS', { USE_EXTERNAL_EMOJIS: true }],
    ['MANAGE_ROLES', { MANAGE_ROLES: true }],
    ['MANAGE_WEBHOOKS', {MANAGE_WEBHOOKS: true}]
])

export const textChannelPermissionDisable: Map<PermissionResolvable, any> = new Map([ // list of permissions for text channels with the corresponding permission overwrites to disable them
    ['CREATE_INSTANT_INVITE', { CREATE_INSTANT_INVITE: false }],
    ['MANAGE_CHANNELS', { MANAGE_CHANNELS: false }],
    ['ADD_REACTIONS', { ADD_REACTIONS: false }],
    ['VIEW_CHANNEL', { VIEW_CHANNEL: false }],
    ['SEND_MESSAGES', { SEND_MESSAGES: false }],
    ['SEND_TTS_MESSAGES', { SEND_TTS_MESSAGES: false }],
    ['MANAGE_MESSAGES', { MANAGE_MESSAGES: false }],
    ['EMBED_LINKS', { EMBED_LINKS: false }],
    ['ATTACH_FILES', { ATTACH_FILES: false }],
    ['READ_MESSAGE_HISTORY', { READ_MESSAGE_HISTORY: false }],
    ['MENTION_EVERYONE', { MENTION_EVERYONE: false }],
    ['USE_EXTERNAL_EMOJIS', { USE_EXTERNAL_EMOJIS: false }],
    ['MANAGE_ROLES', { MANAGE_ROLES: false }],
    ['MANAGE_WEBHOOKS', {MANAGE_WEBHOOKS: false}]
])

export const voiceChannelPermissionsEnable: Map<PermissionResolvable, any> = new Map([ // list of permission overwrites for voice channels
    ['CREATE_INSTANT_INVITE', { CREATE_INSTANT_INVITE: true }],
    ['MANAGE_CHANNELS', { MANAGE_CHANNELS: true }],
    ['PRIORITY_SPEAKER', { PRIORITY_SPEAKER: true }],
    ['STREAM', { STREAM: true }],
    ['VIEW_CHANNEL', { VIEW_CHANNEL: true }],
    ['CONNECT', { CONNECT: true }],
    ['SPEAK', { SPEAK: true }],
    ['MUTE_MEMBERS', { MUTE_MEMBERS: true }],
    ['DEAFEN_MEMBERS', { DEAFEN_MEMBERS: true }],
    ['MOVE_MEMBERS', { MOVE_MEMBERS: true }],
    ['USE_VAD', { USE_VAD: true }],
    ['MANAGE_ROLES', { MANAGE_ROLES: true }]
])

export const voiceChannelPermissionsDisable: Map<PermissionResolvable, any> = new Map([ // list of permission overwrites for voice channels
    ['CREATE_INSTANT_INVITE', { CREATE_INSTANT_INVITE: false }],
    ['MANAGE_CHANNELS', { MANAGE_CHANNELS: false }],
    ['PRIORITY_SPEAKER', { PRIORITY_SPEAKER: false }],
    ['STREAM', { STREAM: false }],
    ['VIEW_CHANNEL', { VIEW_CHANNEL: false }],
    ['CONNECT', { CONNECT: false }],
    ['SPEAK', { SPEAK: false }],
    ['MUTE_MEMBERS', { MUTE_MEMBERS: false }],
    ['DEAFEN_MEMBERS', { DEAFEN_MEMBERS: false }],
    ['MOVE_MEMBERS', { MOVE_MEMBERS: false }],
    ['USE_VAD', { USE_VAD: false }],
    ['MANAGE_ROLES', { MANAGE_ROLES: false }]
])
