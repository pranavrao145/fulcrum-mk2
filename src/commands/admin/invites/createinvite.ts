import { Message, MessageEmbed } from "discord.js";
import { Client } from "pg";
import { ICommand } from "../../../utils/types";

const command: ICommand = {
  name: "createinvite",
  description:
    "Creates an invite with the options given and displays the invite code and URL.",
  alias: ["ci"],
  syntax:
    "f!createinvite (temporary, true/false, defualt false) (max age (seconds), 0 for forever, default 86400) (reason)",
  async execute(message: Message, _con: Client, args?: string[]) {
    console.log(
      `Command createinvite started by user ${
        message.member!.user.tag
      } in guild ${message.guild!.name}.`
    );

    let outputEmbed = new MessageEmbed() // create an embed to display the results of the
      // command
      .setColor("#FFFCF4")
      .setTitle("Create Invite - Report");

    if (!message.member!.permissions.has("CREATE_INSTANT_INVITE")) {
      // check for adequate permissions
      try {
        console.log("Insufficient permissions. Stopping execution.");
        return await message.reply(
          "Sorry, you need to have the `CREATE_INSTANT_INVITE` permission to use this command."
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

    const temporary = args!.shift(); // get the potential boolean for if the
    // channel is temporary and make it lowercase
    const maxAge = args!.shift(); // get the potential max age for the invite
    const reasonToCreate = args!.join(" "); // get the potential reason for creating the invite

    if (reasonToCreate) {
      // if there is a reason to invite, there will also be a max
      // age and temporary flag specified
      console.log(
        "Reason detected. Attempting to create invite with temporary flag, max age, and reason."
      );

      console.log("Checking validity of value given for max age in seconds.");
      const maxAgeNum = parseInt(maxAge!, 10);

      if (isNaN(maxAgeNum)) {
        // checks if the value for max age is a number
        console.log(
          "Invalid number was given for seconds. Stopping execution."
        );
        try {
          return await message.channel.send("Invalid value for seconds.");
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

      if (maxAgeNum < 0 || maxAgeNum > 604800) {
        // check if the value of days (which is definitely a number) is in the allowed range
        try {
          console.log(
            "Invalid number was given for max age. Stopping execution."
          );
          return await message.channel.send(
            "Invalid number for max age. Must be a number from 0-604800."
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

      const temporaryFormatted = temporary!.toLowerCase(); // lowercase the type for consistent formatting

      if (temporaryFormatted !== "true" && temporaryFormatted !== "false") {
        // check if the type given was valid
        try {
          console.log(
            "Temporary flag supplied was invalid. Stopping execution."
          );
          return await message.channel.send(
            "Invalid value for temporary flag! Must be true or false."
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

      if (temporaryFormatted === "true") {
        // if the invite is supposed to be temporary
        try {
          // create the invite with the given information
          const invite = await message.guild!.invites.create(
            message.channel!.id,
            {
              temporary: true,
              maxAge: maxAgeNum,
              reason: reasonToCreate,
            }
          );
          outputEmbed.addField(`Status`, "Success");
          outputEmbed.addField("Code", `${invite.code}`);
          outputEmbed.addField("URL", `${invite.url}`);
          outputEmbed.addField("Temporary", `Yes`);
          outputEmbed.addField("Max Age", `${invite.maxAge} seconds`);
          outputEmbed.addField("Reason", `${reasonToCreate}`);
        } catch (e) {
          console.log(
            `Failed to create invite in server ${
              message.guild!.name
            }. The error message is below:`
          );
          console.log(e);
        }
      } else {
        try {
          // create the invite with the given information
          const invite = await message.guild!.invites.create(
            message.channel!.id,
            {
              temporary: false,
              maxAge: maxAgeNum,
              reason: reasonToCreate,
            }
          );
          outputEmbed.addField(`Status`, "Success");
          outputEmbed.addField("Code", `${invite.code}`);
          outputEmbed.addField("URL", `${invite.url}`);
          outputEmbed.addField("Temporary", `No`);
          outputEmbed.addField("Max Age", `${invite.maxAge} seconds`);
          outputEmbed.addField("Reason", `${reasonToCreate}`);
        } catch (e) {
          console.log(
            `Failed to create invite in server ${
              message.guild!.name
            }. The error message is below:`
          );
          console.log(e);
        }
      }
    } else if (maxAge) {
      // if there is a reason to invite, there will also be a max
      // age and temporary flag specified
      console.log(
        "Max age detected. Attempting to create invite with temporary flag, max age."
      );

      console.log("Checking validity of value given for max age in seconds.");
      const maxAgeNum = parseInt(maxAge!, 10);

      if (isNaN(maxAgeNum)) {
        // checks if the value for max age is a number
        console.log(
          "Invalid number was given for seconds. Stopping execution."
        );
        try {
          return await message.channel.send(
            "Invalid value for seconds. Must be a number from 0-604800"
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

      if (maxAgeNum < 0 || maxAgeNum > 604800) {
        // check if the value of days (which is definitely a number) is in the allowed range
        try {
          console.log(
            "Invalid number was given for max age. Stopping execution."
          );
          return await message.channel.send(
            "Invalid number for max age. Must be a number from 0-604800."
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

      const temporaryFormatted = temporary!.toLowerCase(); // lowercase the type for consistent formatting

      if (temporaryFormatted !== "true" && temporaryFormatted !== "false") {
        // check if the type given was valid
        try {
          console.log(
            "Temporary flag supplied was invalid. Stopping execution."
          );
          return await message.channel.send(
            "Invalid value for temporary flag! Must be true or false."
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

      if (temporaryFormatted === "true") {
        // if the invite is supposed to be temporary
        try {
          // create the invite with the given information
          const invite = await message.guild!.invites.create(
            message.channel!.id,
            {
              temporary: true,
              maxAge: maxAgeNum,
            }
          );
          outputEmbed.addField(`Status`, "Success");
          outputEmbed.addField("Code", `${invite.code}`);
          outputEmbed.addField("URL", `${invite.url}`);
          outputEmbed.addField("Temporary", `Yes`);
          outputEmbed.addField("Max Age", `${invite.maxAge} seconds`);
        } catch (e) {
          console.log(
            `Failed to create invite in server ${
              message.guild!.name
            }. The error message is below:`
          );
          console.log(e);
        }
      } else {
        try {
          // create the invite with the given information
          const invite = await message.guild!.invites.create(
            message.channel!.id,
            {
              temporary: false,
              maxAge: maxAgeNum,
            }
          );
          outputEmbed.addField(`Status`, "Success");
          outputEmbed.addField("Code", `${invite.code}`);
          outputEmbed.addField("URL", `${invite.url}`);
          outputEmbed.addField("Temporary", `No`);
          outputEmbed.addField("Max Age", `${invite.maxAge} seconds`);
        } catch (e) {
          console.log(
            `Failed to create invite in server ${
              message.guild!.name
            }. The error message is below:`
          );
          console.log(e);
        }
      }
    } else if (temporary) {
      // checks if there is a temporary flag specified
      console.log(
        "Temporary flag detected. Attempting to create invite with temporary flag."
      );

      const temporaryFormatted = temporary!.toLowerCase(); // lowercase the type for consistent formatting

      if (temporaryFormatted !== "true" && temporaryFormatted !== "false") {
        // check if the type given was valid
        try {
          console.log(
            "Temporary flag supplied was invalid. Stopping execution."
          );
          return await message.channel.send(
            "Invalid value for temporary flag! Must be true or false."
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

      if (temporaryFormatted === "true") {
        // if the invite is supposed to be temporary
        try {
          // create the invite with the given information
          const invite = await message.guild!.invites.create(
            message.channel!.id,
            {
              temporary: true,
            }
          );
          outputEmbed.addField(`Status`, "Success");
          outputEmbed.addField("Code", `${invite.code}`);
          outputEmbed.addField("URL", `${invite.url}`);
          outputEmbed.addField("Temporary", `Yes`);
        } catch (e) {
          console.log(
            `Failed to create invite in server ${
              message.guild!.name
            }. The error message is below:`
          );
          console.log(e);
        }
      } else {
        try {
          // create the invite with the given information
          const invite = await message.guild!.invites.create(
            message.channel!.id,
            {
              temporary: false,
            }
          );
          outputEmbed.addField(`Status`, "Success");
          outputEmbed.addField("Code", `${invite.code}`);
          outputEmbed.addField("URL", `${invite.url}`);
          outputEmbed.addField("Temporary", `No`);
        } catch (e) {
          console.log(
            `Failed to create invite in server ${
              message.guild!.name
            }. The error message is below:`
          );
          console.log(e);
        }
      }
    } else {
      // if there was no additional information specified
      try {
        // create the invite with the given information
        const invite = await message.guild!.invites.create(message.channel!.id);
        outputEmbed.addField(`Status`, "Success");
        outputEmbed.addField("Code", `${invite.code}`);
        outputEmbed.addField("URL", `${invite.url}`);
      } catch (e) {
        console.log(
          `Failed to create invite in server ${
            message.guild!.name
          }. The error message is below:`
        );
        console.log(e);
      }
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
        `Command createinvite, started by ${
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
