import { Message, MessageEmbed } from "discord.js";
import { ICommand } from "../../../utils/types";
import { Client } from "pg";
import { getUserFromMention, timeout } from "../../../utils/helpers";

const command: ICommand = {
  name: "masskick",
  description:
    "Kicks the members given from the server. You can kick upto 10 members with one command.",
  alias: ["mk"],
  syntax: "f!masskick [user mentions (10 max)]",
  async execute(message: Message, _con: Client, args?: string[]) {
    console.log(
      `Command masskick started by user ${message.member!.user.tag} in guild ${
        message.guild!.name
      }.`
    );

    let outputEmbed = new MessageEmbed() // create an embed to display the results of the command
      .setColor("#FFFCF4")
      .setTitle("Mass Kick - Report");

    let outputEmbedText: string = ""; // text that will eventually be sent as a field in outputEmbed. Mainly for formatting

    if (!message.member!.permissions.has("KICK_MEMBERS")) {
      // check for adequate permissions
      try {
        console.log("Insufficient permissions. Stopping execution.");
        return await message.reply(
          "Sorry, you need to have the `KICK_MEMBERS` permission to use this command."
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

    for (const mention of args!) {
      // iterate through all the user mentions
      const member = getUserFromMention(message, mention); // get the user for the mention

      if (!member) {
        // check if the user actually exists
        console.log("A user supplied was not valid. Skipping over them.");
        outputEmbedText += `\n**${mention}:** Invalid user or user not found`;
        continue;
      }

      try {
        await timeout(300); // setting a short timeout to prevent abuse of Discord's API
        await member.kick(); // attempt to kick the user
        console.log(`User ${member.user.tag} kicked successfully.`);
        outputEmbedText += `\n**${member.user.tag}**: Kicked successfully.`;
      } catch (e) {
        console.log(`Failed to kick user ${member.user.tag}.`);
        outputEmbedText += `\n**${member.user.tag}**: Couldn\'t kick user.`;
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
        `Command masskick, started by ${
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
