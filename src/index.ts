// set env
import * as dotenv from "dotenv";
dotenv.config();

// import all necessary modules
import Discord from "discord.js";
import { Client } from "pg";
import * as database from "./utils/database";
import glob from "glob";
import { promisify } from "util";
import { ICommand } from "./utils/types";
import schedule from "node-schedule";

// initialize client object with all the necessary intents
const client: Discord.Client = new Discord.Client({
  intents: [
    Discord.Intents.FLAGS.GUILDS,
    Discord.Intents.FLAGS.GUILD_BANS,
    Discord.Intents.FLAGS.GUILD_INVITES,
    Discord.Intents.FLAGS.GUILD_MEMBERS,
    Discord.Intents.FLAGS.GUILD_MESSAGES,
    Discord.Intents.FLAGS.GUILD_PRESENCES,
    Discord.Intents.FLAGS.GUILD_VOICE_STATES,
    Discord.Intents.FLAGS.GUILD_MESSAGE_TYPING,
  ],
});

const prefix = "f!"; // declare prefix

// DATABASE CONNECTION

// declare database connection and options
const con = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// connect to database
database.connect(con);

// BOT PREP

// prepare to read command files
const globPromise = promisify(glob);
const commands: Array<ICommand> = [];

// BOT EVENTS

// log in as bot
client.login(process.env.BOT_TOKEN).catch((err: any) => {
  throw err;
});

// on ready, set status and log presence data
client.on("ready", async () => {
  // load in command files
  const commandFiles = await globPromise(`${__dirname}/commands/**/*.{js,ts}`); // identify command files

  for (const file of commandFiles) {
    const command = await import(file);
    commands.push(command);
    console.log(`Command ${command.name} loaded successfully.`);
  }

  console.log(`Logged in as ${client.user!.tag}!`);
  console.log(`Currently in ${client.guilds.cache.size} guilds!`);

  try {
    client.user!.setPresence({
      status: "online",
      activities: [
        {
          name: "f!help",
          type: "WATCHING",
        },
      ],
    });
  } catch (e) {
    console.log(
      "There was an error setting the bot status. The error message is below:"
    );
    console.log(e);
  }

  // at midnight EST everyday, update the date
  schedule.scheduleJob("0 0 * * *", async () => {
    console.log(
      "Midnight EST detected. Attempting to update date in all guilds."
    );

    const updateDateCommand = commands.find((c) => c.name === "updatedate");

    if (!updateDateCommand) {
      console.log("Command updatedate not found. Stopping execution.");
      return;
    }

    updateDateCommand.execute(client, con, undefined); // update the date count (automatic mode)
  });
});

// on a message, parse message for commands and execute accordingly
client.on("messageCreate", async (message: Discord.Message) => {
  // check if the message contains the prefix, and is not by a bot or in a dm
  if (
    !message.content.toLowerCase().startsWith(prefix) ||
    message.author.bot ||
    message.guild === null
  )
    return;

  if (!message.member || !message.guild) return; // check if the member that sent this message and its guild exists

  console.log(
    `Message received from user ${message.member.user.tag}. Checking for valid commands.`
  );

  // parse the message for the correct command and find the associated command file
  const [commandName, ...args] = message.content
    .slice(prefix.length)
    .trim()
    .split(/ +/);

  console.log(`Potential command name: ${commandName}`);
  console.log(`Potential arguments: ${args}`);

  const command = commands.find(
    (c) =>
      c.name === commandName ||
      (c.alias ? c.alias!.includes(commandName) : false)
  );

  // if the command is found, execute it
  if (command) {
    command.execute(message, con, args);
  } else {
    console.log("No command found, ignoring message.");
  }
});

// on a voice state change, add/remove the appropriate voice channel roles
client.on(
  "voiceStateUpdate",
  async (oldState: Discord.VoiceState, newState: Discord.VoiceState) => {
    // three situations exist:
    // 1. User leaves all voice channels
    // 2. User joins a voice channel from no voice channel
    // 3. User joins a voice channel from another voice channel

    if (!oldState.member || !newState.member) return; // check if the voice state change actually involves members
    if (!oldState.guild || !newState.guild) return; // check if the voice state change actually involves a guild

    console.log(
      `Voice state update detected in ${oldState.guild}. Attempting to assign correct voice channel roles.`
    );

    if (oldState.channel && !newState.channel) {
      // if the user leaves all voice channels
      console.log(
        `User ${oldState.member!.user.tag} left all voice channels in guild.`
      );
      const oldRole = oldState.guild.roles.cache.find(
        (r) => r.name === oldState.channel!.name
      ); // find the voice channel role associated with the voice channel

      if (!oldRole) {
        // if there is no voice role associated with the old voice channel
        console.log(
          `No voice channel role found for channel ${oldState.channel.name}. Stopping execution.`
        );
        return;
      }

      try {
        // attempt to remove the role for the old voice channel
        await oldState.member.roles.remove(oldRole);
        console.log(
          `Removed voice channel role ${oldRole.name} from ${oldState.member.user.tag}.`
        );
      } catch (e) {
        console.log(
          `Failed to remove voice channel role ${oldRole.name} from ${oldState.member.user.tag}.`
        );
      }
    } else if (!oldState.channel && newState.channel) {
      // if the user moved from no channel to a voice channel
      console.log(
        `User ${newState.member!.user.tag} joined voice channel in guild.`
      );
      const newRole = newState.guild.roles.cache.find(
        (r) => r.name === newState.channel!.name
      ); // find the voice channel role associated with the voice channel

      if (!newRole) {
        // if there is no voice role associated with the new voice channel
        console.log(
          `No voice channel role found for channel ${newState.channel.name}. Stopping execution.`
        );
        return;
      }

      try {
        // attempt to add the role for the new voice channel
        await newState.member.roles.add(newRole);
        console.log(
          `Added voice channel role ${newRole.name} to ${newState.member.user.tag}.`
        );
      } catch (e) {
        console.log(
          `Failed to add voice channel role ${newRole.name} to ${newState.member.user.tag}.`
        );
      }
    } else if (oldState.channel && newState.channel) {
      // if the user moves from one channel to another
      console.log(
        `User ${
          newState.member!.user.tag
        } moved from one voice channel to another in guild.`
      );
      const oldRole = oldState.guild.roles.cache.find(
        (r) => r.name === oldState.channel!.name
      ); // find the voice channel role associated with the old voice channel
      const newRole = newState.guild.roles.cache.find(
        (r) => r.name === newState.channel!.name
      ); // find the voice channel role associated with the new voice channel

      if (oldRole) {
        // if there is a voice role associated with the old voice channel
        console.log(
          `Role for old voice channel ${oldState.channel.name} found. Attempting to remove role from user.`
        );

        try {
          // attempt to remove the role for the old voice channel
          await oldState.member.roles.remove(oldRole);
          console.log(
            `Removed voice channel role ${oldRole.name} from ${oldState.member.user.tag}.`
          );
        } catch (e) {
          console.log(
            `Failed to remove voice channel role ${oldRole.name} from ${oldState.member.user.tag}.`
          );
        }
      }

      if (newRole) {
        // if there is a voice role associated with the new voice channel
        console.log(
          `Role for new voice channel ${newState.channel.name} found. Attempting to add role to user.`
        );
        try {
          // attempt to add the role for the new voice channel
          await newState.member.roles.add(newRole);
          console.log(
            `Added voice channel role ${newRole.name} to ${newState.member.user.tag}.`
          );
        } catch (e) {
          console.log(
            `Failed to add voice channel role ${newRole.name} to ${newState.member.user.tag}.`
          );
        }
      }
    }

    console.log(
      `Automatic voice channel role update sequence completed successfully in guild ${oldState.guild}.`
    );
  }
);

// every time a voice channel is created, set up the associated voice channel role automatically
client.on("channelCreate", async (channel: Discord.Channel) => {
  if (!channel) return; // ensure that the channel created exists
  if (channel.type !== "GUILD_VOICE") return; // ensure the channel created is a GUILD_VOICE channel
  if (!(channel as Discord.VoiceChannel).guild) return; // check that the voice channel is actually associated with a guild

  console.log(
    `Voice channel creation detected in guild ${
      (channel as Discord.VoiceChannel).guild
    }. Attempting to create associated voice channel role.`
  );

  const vcRole = (channel as Discord.VoiceChannel).guild.roles.cache.find(
    (r) => r.name === (channel as Discord.VoiceChannel).name
  ); // attempt to find a role in the server with the same name as the channel

  if (vcRole) {
    // check if the role already exists
    console.log(
      `Voice channel role already exists for voice channel ${
        (channel as Discord.VoiceChannel).name
      }. Doing nothing.`
    );
    return;
  }

  try {
    const vcRoleCreated = await (
      channel as Discord.VoiceChannel
    ).guild.roles.create({
      // create the role with the same name as the voice channel
      name: (channel as Discord.VoiceChannel).name,
    });
    console.log(`Role ${vcRoleCreated.name} created successfully.`);
  } catch (e) {
    console.log(
      `Failed to create role ${
        (channel as Discord.VoiceChannel).name
      }. The error message is below:`
    );
    console.log(e);
  }

  console.log(
    `Automatic voice channel role creation sequence completed successfully in ${
      (channel as Discord.VoiceChannel).guild
    }.`
  );
});

// every time a voice channel is deleted, delete the associated voice channel role automatically
client.on("channelDelete", async (channel: Discord.Channel) => {
  if (!channel) return; // ensure that the channel deleted existed
  if (channel.type !== "GUILD_VOICE") return; // ensure the channel deleted was a GUILD_VOICE channel
  if (!(channel as Discord.VoiceChannel).guild) return; // check that the voice channel was actually associated with a guild

  console.log(
    `Voice channel deletion detected in guild ${
      (channel as Discord.VoiceChannel).guild
    }. Attempting to delete associated voice channel role.`
  );

  const vcRole = (channel as Discord.VoiceChannel).guild.roles.cache.find(
    (r) => r.name === (channel as Discord.VoiceChannel).name
  ); // attempt to find a role in the server with the same name as the channel

  if (!vcRole) {
    // check if the role already exists
    console.log(
      `Voice channel role already does not exist for voice channel ${
        (channel as Discord.VoiceChannel).name
      }. Doing nothing.`
    );
    return;
  }

  try {
    const vcRoleDeleted = await vcRole.delete(); // delete the role with the same name as the voice channel
    console.log(`Role ${vcRoleDeleted.name} deleted successfully.`);
  } catch (e) {
    console.log(
      `Failed to delete role ${
        (channel as Discord.VoiceChannel).name
      }. The error message is below:`
    );
    console.log(e);
  }

  console.log(
    `Automatic voice channel role deletion sequence completed successfully in ${
      (channel as Discord.VoiceChannel).guild
    }.`
  );
});

// every time a voice channel is updated, update the associated voice channel role
client.on(
  "channelUpdate",
  async (oldChannel: Discord.Channel, newChannel: Discord.Channel) => {
    if (
      !(oldChannel.type === "GUILD_VOICE" && newChannel.type === "GUILD_VOICE")
    )
      return; // if the channel is not a GUILD_VOICE channel, stop the function

    console.log(
      `Voice channel update detected in ${
        (newChannel as Discord.VoiceChannel).guild.name
      }. Attempting to update voice channel role.`
    );

    const vcRole = (oldChannel as Discord.VoiceChannel).guild.roles.cache.find(
      (r) => r.name === (oldChannel as Discord.VoiceChannel).name
    ); // attempt to find a role in the server with the same name as the old channel

    if (!vcRole) {
      // check if the role exists
      console.log(
        `No voice channel role found for channel ${
          (oldChannel as Discord.VoiceChannel).name
        }. Stopping execution.`
      );
      return;
    }

    try {
      await vcRole.setName((newChannel as Discord.VoiceChannel).name);
      console.log(
        `Voice channel role ${
          (oldChannel as Discord.VoiceChannel).name
        } renamed successfully to ${vcRole.name}.`
      );
    } catch (e) {
      console.log(
        `Failed to rename voice channel role ${
          (oldChannel as Discord.VoiceChannel).name
        }. The error message is below:`
      );
      console.log(e);
    }

    console.log(
      `Automatic voice channel role update sequence completed successfully in ${
        (newChannel as Discord.VoiceChannel).guild
      }.`
    );
  }
);

// automatically update member count when someone joins
client.on("guildMemberAdd", async (member: Discord.GuildMember) => {
  if (!member || !member.guild) return; // check that the member actually exists and is associated with a guild

  console.log(
    `Detected new member joining ${member.guild}. Attempting to update member count.`
  );

  const updateMemberCountCommand = commands.find(
    (c) => c.name === "updatemembercount"
  ); // attempt to get the actual command

  if (!updateMemberCountCommand) {
    console.log("Command updatemembercount not found. Stopping execution.");
    return;
  }

  updateMemberCountCommand.execute(member.guild, con, undefined); // update the member count (automatic mode)
});

// automatically update member count when someone leaves
client.on(
  "guildMemberRemove",
  async (member: Discord.GuildMember | Discord.PartialGuildMember) => {
    if (!member || !member.guild) return; // check that the member actually exists and is associated with a guild

    console.log(
      `Detected new member joining ${member.guild}. Attempting to update member count.`
    );

    const updateMemberCountCommand = commands.find(
      (c) => c.name === "updatemembercount"
    ); // attempt to get the actual command

    if (!updateMemberCountCommand) {
      console.log("Command updatemembercount not found. Stopping execution.");
      return;
    }

    updateMemberCountCommand.execute(member.guild, con, undefined); // update the member count (automatic mode)
  }
);

// automatically update channel count when a new channel is created
client.on("channelCreate", async (channel: Discord.Channel) => {
  if (
    !(
      (channel && channel.type === "GUILD_VOICE") ||
      channel.type === "GUILD_TEXT"
    )
  )
    return; // check that the channel actually exists, is of type GUILD_TEXT or GUILD_VOICE, and is associated with a guild

  console.log(
    `Detected new channel created in ${
      ((channel as Discord.TextChannel) || Discord.VoiceChannel).guild.name
    }. Attempting to update channel count.`
  );

  const updateChannelCountCommand = commands.find(
    (c) => c.name === "updatechannelcount"
  ); // attempt to get the actual command

  if (!updateChannelCountCommand) {
    console.log("Command updatechannelcount not found. Stopping execution.");
    return;
  }

  updateChannelCountCommand.execute(
    (channel as Discord.TextChannel | Discord.VoiceChannel).guild,
    con,
    undefined
  ); // update the member count (automatic mode)
});

// automatically update channel count when a channel is deleted
client.on("channelDelete", async (channel: Discord.Channel) => {
  if (
    !(
      (channel && channel.type === "GUILD_VOICE") ||
      channel.type === "GUILD_TEXT"
    )
  )
    return; // check that the channel actually exists, is of type GUILD_TEXT or GUILD_VOICE, and is associated with a guild

  console.log(
    `Detected channel deleted in ${
      ((channel as Discord.TextChannel) || Discord.VoiceChannel).guild.name
    }. Attempting to update channel count.`
  );

  const updateChannelCountCommand = commands.find(
    (c) => c.name === "updatechannelcount"
  ); // attempt to get the actual command

  if (!updateChannelCountCommand) {
    console.log("Command updatechannelcount not found. Stopping execution.");
    return;
  }

  updateChannelCountCommand.execute(
    (channel as Discord.TextChannel | Discord.VoiceChannel).guild,
    con,
    undefined
  ); // update the member count (automatic mode)
});

// when Fulcrum joins a new guild, try to send a start message
client.on("guildCreate", (guild: Discord.Guild) => {
  console.log(
    `Detected new guild ${guild.name}. Attempting to send start message.`
  );
  let channel; // declare empty variable to store which channel to send the startup message in

  if (guild.systemChannel) {
    console.log(
      "Guild system channel found. Preparing to send start message in system channel."
    );
    channel = guild.systemChannel;
  } else {
    console.log(
      "Guild system channel not found. Falling back to first channel where bot has SEND_MESSAGES perimssion."
    );
    const textChannels = guild.channels.cache.filter(
      (c) => c.type === "GUILD_TEXT"
    ); // get text channels in the guild

    if (!textChannels) {
      // if no text channels exist
      console.log("Guild has no text channels. Stopping execution.");
      return;
    }

    channel = textChannels
      .filter((c) => c.permissionsFor(guild.me!)!.has("SEND_MESSAGES"))
      .first(); // get the first channel in which bot has permissions to write
  }

  const startCommand = commands.find((c) => c.name === "start"); // attempt to get the start command

  if (!startCommand) {
    // check if start command actually exists
    console.log("Command start not found. Stopping execution.");
    return;
  }

  if (channel) {
    try {
      (channel as Discord.TextChannel).send(
        "Hi there! Thanks for adding Fulcrum to your server! Take a look at the message below to get started!"
      );

      startCommand.execute(channel, con, undefined);

      (channel as Discord.TextChannel).send(
        "**IMPORTANT:** Given that Fulcrum offers a variety of admin tools, please **ensure Fulcrum's role is above any role you want the bot to modify, and that Fulcrum can view and manage all channels you want it managing.** Otherwise, Fulcrum's features will not work properly."
      );
      (channel as Discord.TextChannel).send(
        "If you like the bot, please consider upvoting: https://top.gg/bot/827156281164955679"
      );
    } catch (e) {
      console.log(
        `There was an error sending a message in the guild ${guild.name}! The error message is below:`
      );
      console.log(e);
      return;
    }
  }
});
