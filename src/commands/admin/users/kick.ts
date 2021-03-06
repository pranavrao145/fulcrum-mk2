import { Message, MessageEmbed } from "discord.js";
import { ICommand } from "../../../utils/types";
import { Client } from "pg";
import { getUserFromMention } from "../../../utils/helpers";

const command: ICommand = {
  name: "kick",
  description:
    "Kicks the given user from the server. You can also optionally specify a reason for kicking.",
  syntax: "f!kick [user mention] (reason)",
  async execute(message: Message, _con: Client, args?: string[]) {
    console.log(
      `Command kick started by user ${message.member!.user.tag} in guild ${
        message.guild!.name
      }.`
    );

    let outputEmbed = new MessageEmbed() // create an embed to display the results of the command
      .setColor("#FFFCF4")
      .setTitle("Kick - Report");

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

    const userMention = args!.shift(); // get the user mention
    const reasonToKick = args!.join(" "); // get the potential reason to kick by joining the rest of the args

    const member = getUserFromMention(message, userMention!);

    if (!member) {
      // check if the user supplied was valid
      console.log("User supplied was invalid. Stopping execution.");
      try {
        return await message.channel.send("Invalid user.");
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

    if (reasonToKick) {
      // check if the user provided a reason to kick
      try {
        await member!.kick(reasonToKick); // kick the user with the reason given
        console.log(`User ${member!.user.tag} kicked successfully.`);
        outputEmbed.addField("Status", "Success");
        outputEmbed.addField("Reason", `${reasonToKick}`);
      } catch (e) {
        console.log(`Failed to kick ${member!.user.tag}.`);
        outputEmbed.addField("Status", "Failed");
      }
    } else {
      // if there is no reason to kick given
      try {
        await member!.kick(); // kick the user with the reason given
        console.log(`User ${member!.user.tag} kicked successfully.`);
        outputEmbed.addField("Status", "Success");
      } catch (e) {
        console.log(`Failed to kick ${member!.user.tag}.`);
        outputEmbed.addField("Status", "Failed");
      }
    }

    try {
      // send output embed with information about the command's success
      if (outputEmbed.fields.length > 0) {
        // check if there are actually any fields to send the embed with
        outputEmbed.setDescription(
          `**Command executed by:** ${
            message.member!.user.tag
          }\n**User kicked:** ${member!.user.tag}`
        );
        await message.channel.send({ embeds: [outputEmbed] });
      }
      console.log(
        `Command kick, started by ${
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
