import {
  Collection,
  GuildMember,
  Message,
  MessageEmbed,
  VoiceChannel,
} from "discord.js";
import { ICommand } from "../../../utils/types";
import { Client } from "pg";
import { getRoleFromMention, timeout } from "../../../utils/helpers";
import { SlashCommandBuilder } from "@discordjs/builders";

const command: ICommand = {
  slashCommand: new SlashCommandBuilder()
    .setName("movevoice")
    .setDescription(
      "Moves the members in the first given voice channel to the other."
    ),
  alias: ["mv"],
  syntax:
    "f!movevoice [voice channel role mention (from)] [voice channel role mention (to)]",
  async execute(message: Message, _con: Client, args?: string[]) {
    console.log(
      `Command movevoice started by user ${message.member!.user.tag} in guild ${
        message.guild!.name
      }.`
    );

    let outputEmbed = new MessageEmbed() // create an embed to display the results of the command
      .setColor("#FFFCF4")
      .setTitle("Move Voice - Report");

    let overallSuccess = true; // to keep track of whether or not the function was overall successful

    if (!message.member!.permissions.has("MOVE_MEMBERS")) {
      // check for adequate permissions
      try {
        console.log("Insufficient permissions. Stopping execution.");
        return await message.reply(
          "Sorry, you need to have the `MOVE_MEMBERS` permission to use this command."
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

    if (!args || args.length !== 2) {
      // check if the args exist (this function requires them) and that there are not too many args
      try {
        console.log("Incorrect syntax given. Stopping execution.");
        return await message.channel.send(
          `Incorrect syntax. Correct syntax: \`${this.syntax}\``
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

    const roleMentionFrom = args!.shift(); // get the voice channel role mention for the voice channel the user is moving from
    const roleMentionTo = args!.shift(); // get the voice channel role mention for the voice channel the user is moving to

    const roleFrom = getRoleFromMention(message, roleMentionFrom!); // actually get the role from
    const roleTo = getRoleFromMention(message, roleMentionTo!); // actually get the role to

    if (!roleFrom || !roleTo) {
      // check if the roles actually exist
      try {
        console.log(
          "One or more voice channel roles supplied was invalid. Stopping execution."
        );
        return await message.channel.send(
          "One or more roles supplied was invalid."
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

    const vcFrom = message
      .guild!.channels.cache.filter((c) => c.type === "GUILD_VOICE")
      .find((c) => c.name === roleFrom.name); // find the voice channel associated with the from role
    const vcTo = message
      .guild!.channels.cache.filter((c) => c.type === "GUILD_VOICE")
      .find((c) => c.name === roleTo.name); // find the voice channel associated with the to role

    if (!vcFrom || !vcTo) {
      // check if the roles are actually associated with a voice channel
      try {
        console.log(
          "One or more voice channel roles supplied was not associated with a voice channel. Stopping execution."
        );
        return await message.channel.send(
          "One or more roles not associated with a voice channel!"
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

    const vcMembers = (
      vcFrom!.members as Collection<string, GuildMember>
    ).values(); // get the members currently in the voice channel

    for (const guildMember of vcMembers) {
      // iterate through each member currently in the voice channel
      if (!guildMember) {
        // check if the guild member actually exists
        console.log(
          `A user in the voice channel was invalid. Skipping over them.`
        );
        overallSuccess = false; // the function has failed, so set overall success to false
        continue;
      }

      try {
        await timeout(300);
        await guildMember.voice.setChannel(vcTo as VoiceChannel); // move user to the correct voice channel
        console.log(
          `Moved ${guildMember.user.tag} from voice channel ${vcFrom.name} to voice channel ${vcTo.name}.`
        );
      } catch (e) {
        console.log(
          `Failed to move ${guildMember.user.tag} from voice channel ${vcFrom.name} to voice channel ${vcTo.name}.`
        );
        overallSuccess = false; // the function has failed, so set overall success to false
      }
    }

    try {
      // send output embed with information about the command's success
      if (overallSuccess) {
        // check if the function was successful and add the right output message
        outputEmbed.addField("Status", "Success");
      } else {
        outputEmbed.addField(
          "Status",
          "Failed - some members may not have been moved"
        );
      }

      outputEmbed.setDescription(
        `**Command executed by:** ${message.member!.user.tag}\n**From:** ${
          vcFrom.name
        }\n**To:** ${vcTo.name}`
      );
      await message.channel.send({ embeds: [outputEmbed] });
      console.log(
        `Command movevoice, started by ${
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
