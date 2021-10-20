import { Message, MessageEmbed } from "discord.js";
import { ICommand } from "../../utils/types";
import { Client } from "pg";
import {
  generalPermissions,
  textChannelPermissions,
  voiceChannelPermissions,
} from "../../utils/information";

const command: ICommand = {
  name: "listpermissions",
  description:
    "Lists permissions and their associated numbers with to use with permission changing commands. Three permission lists exist: the general permission list (to use with f!changerolepermissions), the text permission list (to use with f!changetextpermissions), and the voice permission list (to use with f!changevoicepermissions)",
  alias: ["lp"],
  syntax: "f!listpermissions (type, general/text/voice, default general)",
  async execute(message: Message, _con: Client, args?: string[]) {
    console.log(
      `Command listpermissions started by user ${
        message.member!.user.tag
      } in guild ${message.guild!.name}.`
    );

    const outputEmbed = new MessageEmbed() // create a new embed for output
      .setColor("#FFFCF4")
      .setTitle("Permissions");

    let outputEmbedText = "";

    let type = args!.shift(); // try to get the type specified by the user

    if (!type) {
      console.log("No type given by user. Assuming general.");
      type = "general"; // set type to general explicitly so program knows what to do
    } else {
      console.log(
        `Type detected. Attempting to print permission of type ${type}.`
      );
      type = type.toLowerCase();
    }

    switch (
      type // check different values of type
    ) {
      case "general":
        for (let i = 0; i < generalPermissions.length; i++) {
          // iterate through general permissions using index
          outputEmbedText += `**${i + 1}.** ${generalPermissions[i]}\n`;
        }
        outputEmbed.setDescription(
          `**Command executed by:** ${
            message.member!.user.tag
          }\nThese are general permissions. They (and their corresponding numbers) will be used by Fulcrum to give roles certain priveleges on the whole server.`
        );
        outputEmbed.setFooter(
          "FYI: in commands involving changing permissions, you can refer to permissions by name OR the numbers of the permissions in this list (e.g. 1 refers to CREATE_INSTANT_INVITE)"
        );
        break;
      case "GUILD_TEXT":
        for (let i = 0; i < textChannelPermissions.length; i++) {
          // iterate through text channel permissions using index
          outputEmbedText += `**${i + 1}.** ${textChannelPermissions[i]}\n`;
        }
        outputEmbed.setDescription(
          `**Command executed by:** ${
            message.member!.user.tag
          }\nThese are text channel permissions. They (and their corresponding numbers) will be used by Fulcrum to give roles certain permissions in specific text channels.`
        );
        outputEmbed.setFooter(
          "FYI: in commands involving changing permissions, you can refer to permissions by name OR the numbers of the permissions in this list (e.g. 1 refers to CREATE_INSTANT_INVITE)"
        );
        break;
      case "GUILD_VOICE":
        for (let i = 0; i < voiceChannelPermissions.length; i++) {
          // iterate through voice channel permissions using index
          outputEmbedText += `**${i + 1}.** ${voiceChannelPermissions[i]}\n`;
        }
        outputEmbed.setDescription(
          `**Command executed by:** ${
            message.member!.user.tag
          }\nThese are voice channel permissions. They (and their corresponding numbers) will be used by Fulcrum to give roles certain permissions in specific voice channels.`
        );
        outputEmbed.setFooter(
          "FYI: in commands involving changing permissions, you can need to use the numbers of the permissions in this list to refer to the permissions (e.g. 1 refers to CREATE_INSTANT_INVITE)"
        );
        break;
      default:
        // if the type matches no valid options
        console.log("Permission type given was invalid.");
        outputEmbed.addField(
          "\u200B",
          "Invalid permission type, no permission list available."
        );
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
            `Command listpermissions, started by ${
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
        return;
    }

    try {
      // send output embed with information about the command's success
      outputEmbed.addField("\u200B", outputEmbedText); // add whatever text was accumulated throughout the command to the embed
      if (outputEmbedText !== "") {
        // check if there is actually any text to send the embed with
        await message.channel.send({ embeds: [outputEmbed] });
      }
      console.log(
        `Command listpermissions, started by ${
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
