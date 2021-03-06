import {
  Message,
  MessageEmbed,
  StageChannel,
  TextChannel,
  VoiceChannel,
} from "discord.js";
import { ICommand } from "../../../utils/types";
import { Client } from "pg";
import { timeout } from "../../../utils/helpers";

const command: ICommand = {
  name: "unlockdown",
  description:
    "Releases server from lockdown triggered by f!lockdown. **WARNING:** This **deletes** permission overwrites on the @everyone role for all channels (resets it to default permissions), so make sure any other roles required to restrict permissions are assigned and set with the correct permissions.",
  syntax: "f!unlockdown",
  async execute(message: Message, _con: Client, _args?: string[]) {
    console.log(
      `Command unlockdown started by user ${
        message.member!.user.tag
      } in guild ${message.guild!.name}.`
    );

    let outputEmbed = new MessageEmbed() // create an embed to display the results of the command
      .setColor("#FFFCF4")
      .setTitle("Unlockdown - Report");

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

    try {
      await message.channel.send(
        "Lifting lockdown on server. This may take a moment..."
      );
    } catch (e) {
      console.log(
        `There was an error sending a message in the guild ${
          message.guild!.name
        }! The error message is below:`
      );
      console.log(e);
    }

    const channelList = await message.guild!.channels.fetch(); // get a list of all the channels in the guild

    const textChannels = channelList
      .filter((c) => c.type === "GUILD_TEXT")
      .values(); // get all text channels in guild
    const voiceChannels = channelList
      .filter((c) => c.type === "GUILD_VOICE")
      .values(); // get all voice channels in guild
    const stageVoiceChannels = channelList
      .filter((c) => c.type === "GUILD_STAGE_VOICE")
      .values(); // get all stage voice channels in guild

    let overallUnlockingSuccess = true; // variable to hold whether or not all channels were unlocked successfully

    for (const textChannel of textChannels) {
      // iterate through each of the text channels in the guild
      try {
        await timeout(300); // setting a short timeout to prevent abuse of Discord's API
        await (textChannel as TextChannel).permissionOverwrites.edit(
          (textChannel as TextChannel).guild.roles.everyone,
          { SEND_MESSAGES: null }
        ); // reset permissions on SEND_MESSAGES permission in every text channel
        console.log(
          `Successfully unlocked ${(textChannel as TextChannel).name}.`
        );
      } catch (e) {
        console.log(`Failed to unlock ${(textChannel as TextChannel).name}.`);
        overallUnlockingSuccess = false;
      }
    }

    for (const voiceChannel of voiceChannels) {
      // iterate through each of the voice channels in the guild
      try {
        await timeout(300); // setting a short timeout to prevent abuse of Discord's API
        await (voiceChannel as VoiceChannel).permissionOverwrites.edit(
          (voiceChannel as VoiceChannel).guild.roles.everyone,
          { CONNECT: null }
        ); // reset permissions on CONNECT permission in every voice channel
        console.log(
          `Successfully unlocked ${(voiceChannel as VoiceChannel).name}.`
        );
      } catch (e) {
        console.log(`Failed to unlock ${(voiceChannel as VoiceChannel).name}.`);
        overallUnlockingSuccess = false;
      }
    }

    for (const stageVoiceChannel of stageVoiceChannels) {
      // iterate through each of the stage voice channels in the guild
      try {
        await timeout(300); // setting a short timeout to prevent abuse of Discord's API
        await (stageVoiceChannel as StageChannel).permissionOverwrites.edit(
          (stageVoiceChannel as StageChannel).guild.roles.everyone,
          { CONNECT: null }
        ); // reset permissions on CONNECT permission in every stage channel
        console.log(
          `Successfully unlocked ${(stageVoiceChannel as StageChannel).name}.`
        );
      } catch (e) {
        console.log(
          `Failed to unlock ${(stageVoiceChannel as StageChannel).name}.`
        );
        overallUnlockingSuccess = false;
      }
    }

    if (overallUnlockingSuccess) {
      // check if the locking was successful and add the right output message
      outputEmbed.addField("Status", "Success");
    } else {
      outputEmbed.addField(
        "Status",
        "Failed - some channels may not have been fully unlocked"
      );
    }

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
        `Command unlockdown, started by ${
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
