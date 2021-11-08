import { ICommand } from "../../../utils/types";
import { Message, MessageEmbed } from "discord.js";
import { Client } from "pg";
import { editMessageWithPaginatedEmbeds } from "discord.js-pagination-ts";

const command: ICommand = {
  name: "listroles",
  description:
    "Displays all the roles in the server in a list with numbers for use with other role management commands.",
  alias: ["lr"],
  syntax: "f!listroles",
  async execute(message: Message, _con: Client, _args?: string[]) {
    console.log(
      `Command listroles started by user ${message.member!.user.tag} in guild ${
        message.guild!.name
      }.`
    );

    const roles = await message.guild!.roles.fetch(); // get roles of the server 
    const roleNames = roles.map((r) => r.name);  // map all roles to their names

    let embedList: MessageEmbed[] = []; // declare a list of message embeds, which will be paginated
    let outputEmbedText = "";

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

    const numEmbedPages = Math.ceil(roleNames.length / 10); // there will be 10 roles on each page, so figure out how many pages of embeds

    for (let i = 0; i < numEmbedPages; i++) {
      // create new message embeds with the correct title and description
      embedList.push(
        new MessageEmbed()
          .setTitle(`Roles for ${message.guild!.name}`)
          .setColor("#FFFCF4")
          .setDescription(
            `**Command executed by:** ${message.member!.user.tag}`
          )
      );
    }

    let currentEmbedPage = 0; // a variable to keep track of the current page we're on

    for (let i = 0; i < roleNames.length; i++) {
      // iterate through collection
      outputEmbedText += `**${i + 1}.** ${roleNames[i]}\n`; // add the role to the list
      if (i !== 0 && (i + 1) % 10 === 0) {
        // if the current page is role number is divisible by 10 (and not 0), we must go to a new page
        embedList[currentEmbedPage].addField("\u200B", outputEmbedText); // add the text to the output
        currentEmbedPage++; // move on to the next page
        outputEmbedText = ""; // reset the output embed text
      } else if (i + 1 === roleNames.length) {
        // if we've reached the last role
        embedList[currentEmbedPage].addField("\u200B", outputEmbedText); // add the text to the output
      }
    }

    let embedMessage; // variable to hold message on to which embed will hook

    try {
      embedMessage = await message.channel.send("Loading roles..."); // send a message on to which the embed can hook
    } catch (e) {
      console.log(
        `There was an error sending a message in the guild ${
          message.guild!.name
        }! The error message is below:`
      );
      console.log(e);
      return;
    }

    try {
      // attempt to created paginated embed
      if (embedList.length > 0) {
        // check that there are actually fields with which to send the embed
        await editMessageWithPaginatedEmbeds(embedMessage, embedList, {
          footer:
            "FYI: in commands involving managing roles, you can refer to roles by their mention or by their number in this list",
          timeout: 300000,
        });
      }
      console.log(
        `Command listroles, started by ${
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
