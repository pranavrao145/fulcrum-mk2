import { ICommand } from "../../../utils/types";
import { Message, MessageEmbed } from "discord.js";
import { Client } from "pg";
import { editMessageWithPaginatedEmbeds } from "discord.js-pagination-ts";

const command: ICommand = {
  name: "listinvites",
  description:
    "Displays all the invites in the server in a list with numbers for use with other invite management commands.",
  alias: ["li"],
  syntax: "f!listinvites",
  async execute(message: Message, _con: Client, _args?: string[]) {
    console.log(
      `Command listinvites started by user ${
        message.member!.user.tag
      } in guild ${message.guild!.name}.`
    );

    const invites = message.guild!.invites.cache.map((r) => r.code); // get invites of the server and map them to their IDs

    let embedList: MessageEmbed[] = []; // declare a list of message embeds, which will be paginated
    let outputEmbedText = "";

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

    const numEmbedPages = Math.ceil(invites.length / 10); // there will be 10 invites on each page, so figure out how many pages of embeds

    for (let i = 0; i < numEmbedPages; i++) {
      // create new message embeds with the correct title and description
      embedList.push(
        new MessageEmbed()
          .setTitle(`Invites for ${message.guild!.name}`)
          .setColor("#FFFCF4")
          .setDescription(
            `**Command executed by:** ${message.member!.user.tag}`
          )
      );
    }

    let currentEmbedPage = 0; // a variable to keep track of the current page we're on

    for (let i = 0; i < invites.length; i++) {
      // iterate through collection
      outputEmbedText += `**${i + 1}.** ${invites[i]}\n`; // add the invite to the list
      if (i !== 0 && (i + 1) % 10 === 0) {
        // if the current page is invite number is divisible by 10 (and not 0), we must go to a new page
        embedList[currentEmbedPage].addField("\u200B", outputEmbedText); // add the text to the output
        currentEmbedPage++; // move on to the next page
        outputEmbedText = ""; // reset the output embed text
      } else if (i + 1 === invites.length) {
        // if we've reached the last invite
        embedList[currentEmbedPage].addField("\u200B", outputEmbedText); // add the text to the output
      }
    }

    let embedMessage; // variable to hold message on to which embed will hook

    try {
      embedMessage = await message.channel.send("Loading invites..."); // send a message on to which the embed can hook
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
            "FYI: in commands involving managing invites, you can refer to invites by their code or by their number in this list",
          timeout: 300000,
        });
      } else {
        try {
          console.log("No invites found for server. Stopping execution.");
          return await embedMessage.edit(
            "There are no invites for this server yet."
          );
        } catch (e) {
          console.log(
            `There was an error editing a message in the guild ${
              message.guild!.name
            }! The error message is below:`
          );
          console.log(e);
          return;
        }
      }
      console.log(
        `Command listinvites, started by ${
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
