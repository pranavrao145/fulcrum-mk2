import { Message, MessageEmbed, TextChannel, VoiceChannel } from "discord.js";
import { ICommand } from "../../../utils/types";
import { Client } from "pg";
import {
  getChannelFromMention,
  getRoleFromMention,
  timeout,
} from "../../../utils/helpers";

const command: ICommand = {
  name: "deletechannels",
  description:
    "Deletes all given channels. You can delete upto 10 channels with one command.",
  alias: ["dc", "dcs"],
  syntax:
    "f!deletechannels [channel mentions (voice channel roles for voice channels) (10 max)]",
  async execute(message: Message, _con: Client, args?: string[]) {
    console.log(
      `Command deletechannels started by user ${
        message.member!.user.tag
      } in guild ${message.guild!.name}.`
    );

    let outputEmbed = new MessageEmbed() // create an embed to display the results of the command
      .setColor("#FFFCF4")
      .setTitle("Delete Channels - Report");

    let outputEmbedText: string = ""; // text that will eventually be sent as a field in outputEmbed. Mainly for formatting

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

    if (!args || args.length < 1 || args.length > 10) {
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

    for (const channelMention of args) {
      // iterate through each of the mentions
      const textChannel = getChannelFromMention(message, channelMention); // attempt to get a channel from the mention
      const vcRole = getRoleFromMention(message, channelMention); // attempt to get a role from the mention

      if (textChannel) {
        // if a text channel is detected
        try {
          // attempt to delete the text channel right away
          await timeout(300); // setting a short timeout to prevent abuse of Discord's API
          await textChannel.delete(); // delete the channel
          console.log(
            `Channel ${(textChannel as TextChannel).name} of type ${
              textChannel.type
            } deleted successfully.`
          );
          outputEmbedText += `\n**${
            (textChannel as TextChannel).name
          }**: Channel deleted successfully.`;
        } catch (e) {
          console.log(
            `Failed to delete channel ${(textChannel as TextChannel).name}.`
          );
          outputEmbedText += `\n**${
            (textChannel as TextChannel).name
          }**: Couldn\'t delete channel.`;
        }
      } else if (vcRole) {
        // else if a role is given, check if it is associated with a voice channel
        const voiceChannel = message
          .guild!.channels.cache.filter((c) => c.type === "GUILD_VOICE")
          .find((c) => c.name === vcRole.name); // attempt to get the voice channel associated with the role

        if (!voiceChannel) {
          // if the channel associated with the role does not exist
          console.log(
            "Role supplied was invalid or not associated with a voice channel. Skipping over it."
          );
          outputEmbedText += `\n**${vcRole.name}**: Role not associated with a voice channel.`;
          continue;
        }

        try {
          // attempt to delete the text channel right away
          await timeout(300); // setting a short timeout to prevent abuse of Discord's API
          await voiceChannel!.delete(); // delete the channel
          console.log(
            `Channel ${(voiceChannel as VoiceChannel).name} of type ${
              voiceChannel!.type
            } deleted successfully.`
          );
          outputEmbedText += `\n**${
            (voiceChannel as VoiceChannel).name
          }**: Channel deleted successfully.`;
        } catch (e) {
          console.log(
            `Failed to delete channel ${(voiceChannel as VoiceChannel).name}.`
          );
          outputEmbedText += `\n**${
            (voiceChannel as VoiceChannel).name
          }**: Couldn\'t delete channel.`;
        }
      } else {
        // if the argument supplied is neither a channel nor a role
        console.log(
          `Argument given was invalid for a text channel mention or a voice channel role. Skipping over it.`
        );
        outputEmbedText += `\n**${channelMention}**: Invalid argument for channel or voice channel role.`;
      }
    }

    try {
      // send output embed with information about the command's success
      outputEmbed.addField("\u200B", outputEmbedText); // add whatever text was accumulated throughout the command to the embed
      if (outputEmbedText !== "") {
        // check if there is actually any text to send the embed with
        outputEmbed.setDescription(
          `**Command executed by:** ${message.member!.user.tag}`
        );
        await message.channel.send({ embeds: [outputEmbed] });
      }
      console.log(
        `Command deletechannels, started by ${
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
