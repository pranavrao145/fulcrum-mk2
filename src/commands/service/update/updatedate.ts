import { Message, MessageEmbed } from "discord.js";
import Discord from "discord.js";
import { ICommand } from "../../../utils/types";
import { Client } from "pg";
import { daysList, monthsList } from "../../../utils/information";
import { timeout } from "../../../utils/helpers";
import { SlashCommandBuilder } from "@discordjs/builders";

const command: ICommand = {
  slashCommand: new SlashCommandBuilder()
    .setName("updatedate")
    .setDescription("Updates the date channel in the current guild."),
  alias: ["ud"],
  syntax: "f!updatedate",
  async execute(
    message: Message | Discord.Client,
    con: Client,
    _args?: string[]
  ) {
    if (message instanceof Message) {
      // if the user is trying to update manually
      console.log(
        `Command updatedate started by user ${
          message.member!.user.tag
        } in guild ${message.guild!.name}.`
      );

      let outputEmbed = new MessageEmbed() // create an embed to display the results of the command
        .setColor("#FFFCF4")
        .setTitle("Update Date - Report");

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

      try {
        await timeout(1000); // wait for one second before querying the database
        console.log(
          `Querying database to find date channel for guild ${
            message.guild!.name
          }.`
        );
        const res = await con.query(
          `SELECT * FROM datechannel WHERE guildid = '${message.guild!.id}'`
        ); // find the id of the date channel for the guild of the message

        const row = res.rows[0]; // get the first row from the database query result
        let voiceChannel; // declare voice channel that may be initialized later if there is a match

        if (!row) {
          // in the event a row does not exist
          try {
            console.log(
              `Date channel ID for guild does not exist in database.`
            );
            return await message.channel.send(
              "Date channel not set up for this server! Run f!setup date."
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

        voiceChannel = message.guild!.channels.cache.get(row.channelid); // get the voice channel in the guild according to the id found

        if (!voiceChannel) {
          // in the event the voice channel does not exist
          try {
            console.log(
              `No voice channel found for the channel ID ${row.channelid} in the database.`
            );
            return await message.channel.send(
              "Date channel not set up for this server! Run f!setup date."
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

        const date = new Date(); // get the current date in the configured timezone
        const nameToBeSet = // what the formatted date should be
          "📅|" +
          daysList[date.getDay()] +
          ", " +
          monthsList[date.getMonth()] +
          " " +
          date.getDate() +
          ", " +
          date.getFullYear();

        if (voiceChannel.name === nameToBeSet) {
          // if the voice channel name is already correct, no need to change it
          try {
            console.log(`Date channel for this guild is already updated.`);
            return await message.channel.send(
              "Date is already updated on this server!"
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
          await voiceChannel.setName(nameToBeSet, "Updated date channel."); // attempt to set the voice channel name to the right date
          console.log("Date channel updated successfully.");
          outputEmbed.addField("Status", "Success");
        } catch (e) {
          console.log(
            "Failed to upadate date channel. The error message is below:"
          );
          console.log(e);
          outputEmbed.addField("Status", "Failed");
        }
      } catch (e) {
        console.log(
          "There was an error retrieving for the guild from the database. The error message is below:"
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
          `Command updatedate, started by ${
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
    } else {
      // if the process is automatic
      console.log(`Automatic date update triggered.`);
      const clientGuilds = message.guilds.cache.values(); // get the guilds of the client

      if (!clientGuilds) {
        // if there are no guilds to update
        console.log(
          "No guild found in which to update date. Stopping execution."
        );
        return;
      }

      for (const guild of clientGuilds) {
        console.log(`Attempting to update date in guild ${guild.id}.`);
        try {
          await timeout(1000); // wait for one second before querying the database
          console.log(`Querying database to find date channel for guild.`);
          const res = await con.query(
            `SELECT * FROM datechannel WHERE guildid = '${guild.id}'`
          ); // find the id of the date channel for the guild

          const row = res.rows[0]; // get the first row from the database query result
          let voiceChannel; // declare voice channel that may be initialized later if there is a match

          if (!row) {
            // in the event a row does not exist
            console.log(
              `Date channel ID for guild does not exist in database. Skipping over it.`
            );
            continue;
          }

          voiceChannel = guild.channels.cache.get(row.channelid); // get the voice channel in the guild according to the id found

          if (!voiceChannel) {
            // in the event the voice channel does not exist
            console.log(
              `No voice channel found for the channel ID ${row.channelid} in the database. Skipping over guild.`
            );
            continue;
          }

          const date = new Date(); // get the current date in the configured timezone
          const nameToBeSet = // what the formatted date should be
            "📅|" +
            daysList[date.getDay()] +
            ", " +
            monthsList[date.getMonth()] +
            " " +
            date.getDate() +
            ", " +
            date.getFullYear();

          if (voiceChannel.name === nameToBeSet) {
            // if the voice channel name is already correct, no need to change i
            console.log(
              `Date channel for this guild is already updated. Skipping over it.`
            );
            continue;
          }

          try {
            await voiceChannel.setName(nameToBeSet, "Updated date channel."); // attempt to set the voice channel name to the right date
            console.log(`Date channel updated successfully.`);
            await timeout(30000); // wait 5 mins before moving on to the next guild
          } catch (e) {
            console.log(
              `Failed to upadate date channel. The error message is below:`
            );
            console.log(e);
          }
        } catch (e) {
          console.log(
            `There was an error retrieving for the guild from the database. The error message is below:`
          );
          console.log(e);
        }
      }
      console.log(`Automatic date update sequence completed successfully.`);
    }
  },
};
export = command; // export the command to the main module
