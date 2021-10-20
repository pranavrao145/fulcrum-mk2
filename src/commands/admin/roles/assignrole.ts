import { Message, MessageEmbed } from "discord.js";
import { ICommand } from "../../../utils/types";
import { Client } from "pg";
import {
  getRoleFromMention,
  getUserFromMention,
  timeout,
} from "../../../utils/helpers";

const command: ICommand = {
  name: "assignrole",
  description:
    "Adds the given role to the given user(s). You can give a role to upto 10 users with one command.",
  alias: ["ar"],
  syntax: "f!assignrole [role mention or number] [user mentions (10 max)]",
  async execute(message: Message, _con: Client, args?: string[]) {
    console.log(
      `Command assignrole started by user ${
        message.member!.user.tag
      } in guild ${message.guild!.name}.`
    );

    let outputEmbed = new MessageEmbed() // create an embed to display the results of the command
      .setColor("#FFFCF4")
      .setTitle("Assign Roles - Report");

    let outputEmbedText: string = ""; // text that will eventually be sent as a field in outputEmbed. Mainly for formatting

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

    if (!args || args.length === 0 || args.length < 2 || args.length > 11) {
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

    const roleMention = args!.shift(); // find the mention of the role numbers in the args
    let role; // declare role object, to be determined later using logic below

    if (isNaN(parseInt(roleMention!))) {
      // if the arg is a mention and not a number
      console.log("Role is of type mention. Getting role from role cache.");
      role = getRoleFromMention(message, roleMention!); // then get it from the role cache
    } else {
      console.log("Role is of type number. Getting role using position.");
      role = message.guild!.roles.cache.get(
        message.guild!.roles.cache.map((r) => r.id)[parseInt(roleMention!) - 1]
      ); // else find the role by its position number
    }

    if (!role) {
      // check if the role supplied was valid
      console.log("Role supplied was invalid. Stopping execution.");
      try {
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
        await member.roles.add(role!); // adding role to the member
        console.log(
          `Role ${role!.name} added to ${member.user.tag} successfully.`
        );
        outputEmbedText += `\n**${member.user.tag}**: Role added successfully.`;
      } catch (e) {
        console.log(`Failed to add role ${role!.name} to ${member.user.tag}.`);
        outputEmbedText += `\n**${member.user.tag}**: Couldn\'t add role.`;
      }
    }

    try {
      // send output embed with information about the command's success
      outputEmbed.addField("\u200B", outputEmbedText); // add whatever text was accumulated throughout the command to the embed
      if (outputEmbedText !== "") {
        // check if there is actually any text to send the embed with
        outputEmbed.setDescription(
          `**Command executed by:** ${
            message.member!.user.tag
          }\n**Assigned role:** ${role!.name}`
        );
        await message.channel.send({ embeds: [outputEmbed] });
      }
      console.log(
        `Command assignrole, started by ${
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
