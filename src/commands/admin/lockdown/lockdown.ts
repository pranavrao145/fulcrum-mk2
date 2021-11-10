import { Message, MessageEmbed, TextChannel, VoiceChannel } from "discord.js";
import { Client } from "pg";

import { timeout } from "../../../utils/helpers";
import { ICommand } from "../../../utils/types";

const command: ICommand = {
  name: "lockdown",
  description:
    "Locks down the whole server, disabling people without special priveleges from sending messages and connecting to voice channels. Also optionally deletes any and all active invites to the server. **WARNING:** To be used in emergencies only (situations like extreme and unmanageable bot attacks). This command can only be used with guild members with the ADMINISTRATOR command. You can lift the lockdown using f!unlockdown, but you must regenerate any deleted invites on your own.",
  syntax: "f!lockdown (delete all invites, true/false, default false)",
  async execute(message: Message, _con: Client, args?: string[]) {
    console.log(
      `Command lockdown started by user ${message.member!.user.tag} in guild ${
        message.guild!.name
      }.`
    );

    let outputEmbed = new MessageEmbed() // create an embed to display the
      // results of the command
      .setColor("#FFFCF4")
      .setTitle("Lockdown - Report");

    let outputEmbedText = "";

    if (!message.member!.permissions.has("ADMINISTRATOR")) {
      // check for adequate permissions
      try {
        console.log("Insufficient permissions. Stopping execution.");
        return await message.reply(
          "Sorry, you need to have the `ADMINISTRATOR` permission to use this command."
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

    let lockdownMessage: Message;

    try {
      lockdownMessage = await message.channel.send(
        "Beginning server lockdown sequence. This may take a moment..."
      );
    } catch (e) {
      console.log(
        `There was an error sending a message in the guild ${
          message.guild!.name
        }! The error message is below:`
      );
      console.log(e);
    }

    const deleteAllInvites = args!.shift(); // try to get the value if the user specified whether or
    // not all invites to the server should be deleted

    const textChannels = message
      .guild!.channels.cache.filter((c) => c.type === "GUILD_TEXT")
      .values(); // get all text channels in guild
    const voiceChannels = message
      .guild!.channels.cache.filter((c) => c.type === "GUILD_VOICE")
      .values(); // get all voice channels in guild

    let overallLockingSuccess = true; // variable to hold whether or not all
    // channels were locked successfully

    for (const textChannel of textChannels) {
      // iterate through each of the text channels in the guild
      try {
        await timeout(300); // setting a short timeout to prevent abuse of Discord's API
        await (textChannel as TextChannel).permissionOverwrites.create(
          (textChannel as TextChannel).guild.roles.everyone,
          {
            SEND_MESSAGES: false,
          }
        ); // set the channel as read only for everyone
        console.log(
          `Successfully locked ${(textChannel as TextChannel).name}.`
        );
      } catch (e) {
        console.log(`Failed to lock ${(textChannel as TextChannel).name}.`);
        overallLockingSuccess = false;
      }
    }

    for (const voiceChannel of voiceChannels) {
      // iterate through each of the voice channels in the guild
      try {
        await timeout(300); // setting a short timeout to prevent abuse of Discord's API
        await (voiceChannel as VoiceChannel).permissionOverwrites.create(
          (voiceChannel as VoiceChannel).guild.roles.everyone,
          {
            CONNECT: false,
          }
        ); // get rid of the ability to connect to voice channels for
        // everyone role
        console.log(
          `Successfully locked ${(voiceChannel as VoiceChannel).name}.`
        );
      } catch (e) {
        console.log(`Failed to lock ${(voiceChannel as VoiceChannel).name}.`);
        overallLockingSuccess = false;
      }
    }

    if (overallLockingSuccess) {
      // check if the locking was successful and add the right output message
      outputEmbed.addField("Status", "Success");
    } else {
      outputEmbed.addField(
        "Status",
        "Failed - some channels may not have been fully locked down"
      );
    }

    if (deleteAllInvites) {
      // if there is some argument specified
      const deleteOptionFormatted = deleteAllInvites.toLowerCase(); // convert the argument given to lower case

      if (
        deleteOptionFormatted !== "true" &&
        deleteOptionFormatted !== "false"
      ) {
        // check if the type given was valid
        try {
          console.log(
            "Delete invites flag supplied was invalid. Stopping execution."
          );
          return await lockdownMessage!.edit(
            "Invalid value for delete invites flag! Must be true or false. **Note:** the server was still locked down, but no invites were deleted."
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

      if (deleteOptionFormatted === "true") {
        console.log(
          "Yes given for whether to delete invites. Attempting to delete invites."
        );
        try {
          const invites = await message.guild!.invites.fetch(); // attempt to fetch invites of guild
          const inviteValues = invites.values(); // get the actual invites
          console.log("Invites for server fetched successfully.");
          for (const invite of inviteValues) {
            // iterate through each of the invite IDs and delete them from the
            // collection
            try {
              await timeout(300); // setting a short timeout to prevent abuse of
              // Discord's API
              await invite.delete("Server lockdown"); // delete the invite
              console.log(`Invite ${invite.code} deleted successfully.`);
              outputEmbedText += `\n**${invite.code}**: Invite deleted successfully.`;
            } catch (e) {
              console.log(`Failed to delete invite ${invite.code}.`);
              outputEmbedText += `\n**${invite.code}**: Couldn\'t delete invite`;
            }
          }
        } catch (e) {
          console.log("Failed to fetch invites.");
          outputEmbedText += "Failed to get invites";
        }
      } else if (deleteOptionFormatted === "false") {
        console.log(
          "No given for whether to delete invites. Proceeding without deleting invites."
        );
        outputEmbedText += "No invites were deleted";
      }
    } else {
      // if there is no specification as to whether or not to delete the invites
      console.log(
        "No specification given for whether to delete invites. Defaulting to no."
      );
      outputEmbedText += "No invites were deleted";
    }

    try {
      // send output embed with information about the command's success
      outputEmbed.addField("Invitation Deletion", outputEmbedText); // add whatever text was accumulated throughout the
      // command to the embed
      if (outputEmbedText !== "" && outputEmbed.fields.length > 0) {
        // check if there is actually any text to send the embed with
        outputEmbed.setDescription(
          `**Command executed by:** ${message.member!.user.tag}`
        );
        await message.channel.send({ embeds: [outputEmbed] });
      }
      console.log(
        `Command lockdown, started by ${
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
