import { Message, MessageEmbed } from "discord.js";
import { ICommand } from "../../../utils/types";
import { Client } from "pg";
import { getRoleFromMention } from "../../../utils/helpers";
import { promisify } from "util";
import glob from "glob";
import { SlashCommandBuilder } from "@discordjs/builders";

const command: ICommand = {
  slashCommand: new SlashCommandBuilder()
    .setName("setupchannelcount")
    .setDescription("Sets up Fulcrum's channel count channel feature."),
  alias: ["scc"],
  syntax: "f!setupchannelcount [voice channel role mention]",
  async execute(message: Message, con: Client, args?: string[]) {
    console.log(
      `Command setupchannelcount started by user ${
        message.member!.user.tag
      } in guild ${message.guild!.name}.`
    );

    const outputEmbed = new MessageEmbed() // create a new embed for output
      .setColor("#FFFCF4")
      .setTitle("Setup Channel Count Channel - Report");

    if (!message.member!.permissions.has("MANAGE_CHANNELS")) {
      // check for adequate permissions
      try {
        console.log("Insufficient permissions. Stopping execution.");
        return await message.reply(
          "Sorry, you need to have the `MANAGE_CHANNELS` permission to use this command."
        );
      } catch (e) {
        console.log(
          `There was an error sending a message in the guild ${
            message.guild!.name
          }! The error message is below:`
        );
        console.log(e);
        return;
      }
    }

    if (!args || args.length === 0) {
      // check if the args exist (this function requires them) and that there are not too many args
      try {
        console.log("Incorrect syntax given. Stopping execution.");
        return await message.channel.send(
          `Incorrect syntax. correct syntax: \`${this.syntax}\``
        );
      } catch (e) {
        console.log(
          `There was an error sending a message in the guild ${
            message.guild!.name
          }! The error message is below:`
        );
        console.log(e);
        return;
      }
    }

    const roleMention = args.shift(); // get the voice channel role mention
    const vcRole = getRoleFromMention(message, roleMention!); // get the actual role mention

    if (!vcRole) {
      // if the voice channel role does not exist
      console.log("Invalid voice channel role given. Stopping execution.");
      try {
        return await message.channel.send("Invalid role.");
      } catch (e) {
        console.log(
          `There was an error sending a message in the guild ${
            message.guild!.name
          }! The error message is below:`
        );
        console.log(e);
        return;
      }
    }

    const voiceChannel = message
      .guild!.channels.cache.filter((c) => c.type === "GUILD_VOICE")
      .find((c) => c.name === vcRole.name); // attempt to get voice channel with the same name

    if (!voiceChannel) {
      console.log(
        "No voice channel found associated with the role supplied. Stopping execution."
      );
      try {
        return await message.channel.send(
          "No voice channel found for that role!"
        );
      } catch (e) {
        console.log(
          `There was an error sending a message in the guild ${
            message.guild!.name
          }! The error message is below:`
        );
        console.log(e);
        return;
      }
    }

    try {
      console.log(
        "Attempting to retrieve channel count channel information from the database."
      );
      const res = await con.query(
        `SELECT * FROM channelcountchannel WHERE guildid = '${
          message.guild!.id
        }'`
      ); // see if the guild already has a channel ID in the database

      const row = res.rows[0];
      let query; // query variable that will be initialized later with query that needs to be made to the database

      if (row) {
        // if a row exists for the guild (update)
        console.log(
          "Existing entry for guild found in the database. Overwriting with new channel ID provided."
        );
        query = `UPDATE channelcountchannel SET guildid   = '${
          message.guild!.id
        }', channelid = '${voiceChannel.id}' WHERE guildid = '${
          message.guild!.id
        }'`; // update the existing channel count channel with the new one
      } else {
        // if a row does not exist for a guild (create)
        console.log(
          "No entry found for guild in the database. Creating a new one."
        );
        query = `INSERT INTO channelcountchannel(guildid, channelid) VALUES ('${
          message.guild!.id
        }', '${voiceChannel.id}')`; // create a new row in database with id of channel supplied
      }

      try {
        await con.query(query); // try to query the database with the appropriate query
        console.log(
          "Successfully updated channel count channel information in the database."
        );
        outputEmbed.addField("Status", "Success");
      } catch (e) {
        console.log(
          "There was an error retrieving or inserting data for the guild from the database. The error message is below:"
        );
        console.log(e);
        outputEmbed.addField("Status", "Failed");
      }

      // the way the program is written means there is no direct access to the client's commands, so they must be read again
      // getting the updatechannelcount command to execute right after channelcount has been set
      const globPromise = promisify(glob);

      const serviceCommands: Array<ICommand> = [];
      const serviceCommandFiles = await globPromise(
        `${__dirname}/../**/*.{ts, js}`
      ); // identify command files

      for (const file of serviceCommandFiles) {
        // load in service command files
        const serviceCommand = await import(file);
        serviceCommands.push(serviceCommand);
      }

      const updateChannelCountCommand = serviceCommands.find(
        (c) => c.slashCommand.name === "updatechannelcount"
      ); // get the updatechannelcount command

      if (updateChannelCountCommand) {
        // check if the command exists
        console.log("Handing execution to updatechannelcount command.");
        updateChannelCountCommand.execute(message, con, args); // execute the updatechannelcount command
      } else {
        console.log(
          "Command updatechannelcount not found. Skipping attempted updating of newly created channel count channel."
        );
      }
    } catch (e) {
      console.log(
        "There was an error retrieving or inserting data for the guild from the database. The error message is below:"
      );
      console.log(e);
      outputEmbed.addField("Status", "Failed");
    }

    try {
      // send output embed with information about the command's success
      if (outputEmbed.fields.length > 0) {
        // check if there are actually any fields to send the embed with
        outputEmbed.setDescription(
          `**Command executed by:** ${message.member!.user.tag}`
        );
        await message.channel.send({ embeds: [outputEmbed] });
      }
      console.log(
        `Command setupchannelcount, started by ${
          message.member!.user.tag
        }, terminated successfully in ${message.guild!.name}.`
      );
    } catch (e) {
      console.log(
        `There was an error sending an embed in the guild ${
          message.guild!.name
        }! The error message is below:`
      );
      console.log(e);
    }
  },
};

export = command; // export the command to the main module
