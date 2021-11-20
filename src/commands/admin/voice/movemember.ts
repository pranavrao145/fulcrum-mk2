import { Message, MessageEmbed, VoiceChannel } from "discord.js";
import { Client } from "pg";
import { getRoleFromMention, getUserFromMention } from "../../../utils/helpers";
import { ICommand } from "../../../utils/types";

const command: ICommand = {
  name: "movemember",
  description: "Moves a member from one voice or stage channel to another.",
  alias: ["mm"],
  syntax: "f!movemember [user mention] [voice channel role mention (to)]",
  async execute(message: Message, _con: Client, args?: string[]) {
    console.log(
      `Command movemember started by user ${
        message.member!.user.tag
      } in guild ${message.guild!.name}.`
    );

    let outputEmbed = new MessageEmbed() // create an embed to display the
      // results of the command
      .setColor("#FFFCF4")
      .setTitle("Move Member - Report");

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
      // check if the args exist (this function requires them) and that there
      // are not too many args
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

    const userMention = args!.shift(); // get the voice channel role mention for the voice
    // channel the user is moving from
    const roleMentionTo = args!.shift(); // get the voice channel role mention for the voice
    // channel the user is moving to

    const user = getUserFromMention(message, userMention!); // actually get the role from
    const roleTo = getRoleFromMention(message, roleMentionTo!); // actually get the role to

    if (!user) {
      // check if the user exists
      try {
        console.log("The user supplied was invalid. Stopping execution.");
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

    if (!user.voice.channel) {
      // check if the user is currently in a voice channel
      try {
        console.log(
          "The user supplied was not in a voice channel. Stopping execution."
        );
        return await message.channel.send("User not in a valid voice channel.");
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

    if (!roleTo) {
      // check if the vc role actually exists
      try {
        console.log("Invalid voice channel role given. Stopping execution.");
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

    const vcTo = message
      .guild!.channels.cache.filter(
        (c) => c.type === "GUILD_VOICE" || c.type === "GUILD_STAGE_VOICE"
      )
      .find((c) => c.name === roleTo.name); // find the voice channel
    // associated with the to role

    if (!vcTo) {
      // check if the role is actually associated with a voice channel
      try {
        console.log(
          "Role supplied was not associated with a voice channel. Stopping execution."
        );
        return await message.channel.send(
          "Role is not associated with a voice channel!"
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

    const oldChannelName = user.voice.channel!.name; // get the name of the old voice channel the user was in

    try {
      await user.voice.setChannel(vcTo as VoiceChannel); // move user to the correct voice channel
      console.log(
        `Moved ${user.user.tag} from voice channel ${oldChannelName} to voice channel ${vcTo.name}.`
      );
      outputEmbed.addField("Status", "Success");
    } catch (e) {
      console.log(
        `Failed to move ${user.user.tag} from voice channel ${oldChannelName} to voice channel ${vcTo.name}.`
      );
      outputEmbed.addField("Status", "Failed");
    }
    try {
      // send output embed with information about the command's success
      if (outputEmbed.fields.length > 0) {
        // check if there are actually any fields to send the embed with
        outputEmbed.setDescription(
          `**Command executed by:** ${
            message.member!.user.tag
          }\n**From:** ${oldChannelName}\**To:** ${user.voice.channel.name}`
        );
        await message.channel.send({ embeds: [outputEmbed] });
      }
      console.log(
        `Command movemember, started by ${
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
