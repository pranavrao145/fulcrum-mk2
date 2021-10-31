import { Message, MessageEmbed } from "discord.js";
import { ICommand } from "../../../utils/types";
import { Client } from "pg";
import { timeout } from "../../../utils/helpers";
import { SlashCommandBuilder } from "@discordjs/builders";

const command: ICommand = {
  slashCommand: new SlashCommandBuilder()
    .setName("setupvcroles")
    .setDescription(
      "Sets up Fulcrum's voice channel role feature. This can also be run to create any roles that currently do not exist, even after initial setup."
    ),
  alias: ["svc"],
  syntax: "f!setupvcroles",
  async execute(message: Message, _con: Client, _args?: string[]) {
    console.log(
      `Command setupvcroles started by user ${
        message.member!.user.tag
      } in guild ${message.guild!.name}.`
    );

    const outputEmbed = new MessageEmbed() // create a new embed for output
      .setColor("#FFFCF4")
      .setTitle("Setup Voice Channel Roles - Report");

    let overallSuccess = true; // to keep track of whether or not the function was overall successful

    if (!message.member!.permissions.has("MANAGE_ROLES")) {
      // check for adequate permissions
      try {
        console.log("Insufficient permissions. Stopping execution.");
        return await message.reply(
          "Sorry, you need to have the `MANAGE_ROLES` permission to use this command."
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
      await message.channel.send(
        "Setting up voice channel roles. This may take a moment..."
      );
    } catch (e) {
      console.log(
        `There was an error sending a message in the guild ${
          message.guild!.name
        }! The error message is below:`
      );
      console.log(e);
    }

    const voiceChannels = message
      .guild!.channels.cache.filter((c) => c.type === "GUILD_VOICE")
      .values(); // get all the voice channels in the server

    for (const voiceChannel of voiceChannels) {
      // iterate through each of the voice channel IDs to create a voice channel role for each
      if (!voiceChannel) {
        // check if the voice channel actually exists
        console.log(`A voice channel did not exist. Skipping over it.`);
        continue;
      }

      const vcRole = message.guild!.roles.cache.find(
        (r) => r.name === voiceChannel.name
      ); // attempt to find a role in the server with the same name as the channel

      if (vcRole) {
        // check if the role already exists
        console.log(
          `Voice channel role already exists for voice channel ${voiceChannel.name}. Skipping over it.`
        );
        continue;
      }

      try {
        await timeout(300);
        const vcRoleCreated = await message.guild!.roles.create({
          // create the role with the same name as the voice channel
        });
        console.log(`Role ${vcRoleCreated.name} created successfully.`);
      } catch (e) {
        console.log(
          `Failed to create role ${voiceChannel.name}. The error message is below:`
        );
        console.log(e);
        overallSuccess = false; // the function has failed, so set overall success to false
      }
    }

    if (overallSuccess) {
      // check if the command was successful and add the according message
      console.log(`Voice channel roles set up successfully.`);
      outputEmbed.addField("Status", "Success");
    } else {
      console.log(`Failed to set up some voice channel roles.`);
      outputEmbed.addField(
        "Status",
        "Failed - some voice channel roles may not have been fully set up"
      );
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
        `Command setupvcroles, started by ${
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
