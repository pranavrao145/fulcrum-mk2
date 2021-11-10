import { Message, MessageEmbed } from "discord.js";
import { Client } from "pg";
import { timeout } from "../../../utils/helpers";
import { ICommand } from "../../../utils/types";

const command: ICommand = {
  name: "deleteinvites",
  description:
    "Deletes the invites(s) given. You can delete upto 10 invites with one command.",
  alias: ["di", "dis"],
  syntax: "f!deleteinvites [invite codes (10 max)]",
  async execute(message: Message, _con: Client, args?: string[]) {
    console.log(
      `Command deleteinvites started by user ${
        message.member!.user.tag
      } in guild ${message.guild!.name}.`
    );

    let outputEmbed = new MessageEmbed() // create an embed to display the results of the
      // command
      .setColor("#FFFCF4")
      .setTitle("Delete Invites - Report");

    let outputEmbedText: string = ""; // text that will eventually be sent as a field in outputEmbed.
    // Mainly for formatting

    if (!message.member!.permissions.has("MANAGE_GUILD")) {
      // check for adequate permissions
      try {
        console.log("Insufficient permissions. Stopping execution.");
        return await message.reply(
          "Sorry, you need to have the `MANAGE_GUILD` permission to use this command."
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

    if (!args || args.length === 0 || args.length < 1 || args.length > 10) {
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

    const inviteList = message.guild!.invites.cache.map((i) => i.code);

    for (const code of args!) {
      // iterate through all the mentions given
      let invite; // declare invite object, to be determined later using logic
      // below

      if (isNaN(parseInt(code))) {
        // if the arg is a mention and not a number
        console.log(
          "Invite is of type code. Getting invite from invite cache."
        );
        invite = message.guild!.invites.resolve(code); // resolve the invite using the code
      } else {
        console.log("Invite is of type number. Getting invite using position.");
        invite = message.guild!.invites.resolve(inviteList[parseInt(code) - 1]); // else use the index in the list
        // to find the invite by its code
      }

      if (!invite) {
        // check if the invite exists or not
        console.log("An invite supplied was not valid. Skipping over it.");
        outputEmbedText += `\n**${code}:** Invalid invite or invite not found`;
        continue;
      }

      try {
        await timeout(300); // setting a short timeout to prevent abuse of Discord's API
        await invite.delete(); // attempt to delete the invite
        console.log(`Invite ${invite.code} deleted successfully.`);
        outputEmbedText += `\n**${invite.code}**: Invite deleted successfully.`;
      } catch (e) {
        console.log(`Failed to delete invite ${invite.code}.`);
        outputEmbedText += `\n**${invite.code}**: Couldn\'t delete invite.`;
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
        `Command deleteinvites, started by ${
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
