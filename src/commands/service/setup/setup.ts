import { Message } from "discord.js";
import { ICommand } from "../../../utils/types";
import { Client } from "pg";
import { promisify } from "util";
import glob from "glob";
import { SlashCommandBuilder } from "@discordjs/builders";

const command: ICommand = {
  slashCommand: new SlashCommandBuilder()
    .setName("setup")
    .setDescription(
      "Sets up the service specified. See f!services for a full list of services that Fulcrum offers."
    ),
  alias: ["s"],
  syntax: "f!setup [service] (options)",
  async execute(message: Message, con: Client, args?: string[]) {
    console.log(
      `Command setup started by user ${message.member!.user.tag} in guild ${
        message.guild!.name
      }.`
    );

    if (!args || args.length === 0) {
      // check if the args exist (this function requires them) and that there are not too many args
      try {
        console.log("Incorrect syntax given. Stopping execution.");
        return await message.channel.send(
          `Incorrect syntax. correct syntax: \`${this.syntax}\``
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

    const service = args.shift(); // try to get the service the user wants to setup

    // the way the program is written means there is no direct access to the client's commands, so they must be read again
    const globPromise = promisify(glob);

    const serviceCommands: Array<ICommand> = [];
    const serviceCommandFiles = await globPromise(`${__dirname}/*.{js,ts}`); // identify command files

    for (const file of serviceCommandFiles) {
      // load in service command files
      const serviceCommand = await import(file);
      serviceCommands.push(serviceCommand);
    }

    let serviceCommand; // declare command variable to use later in determining which function to execute

    switch (
      service // check for different services to setup
    ) {
      case "channelcount":
        serviceCommand = serviceCommands.find(
          (c) => c.slashCommand.name === "setupchannelcount"
        ); // get the channelcount command

        if (!serviceCommand) {
          // if the command does not exist
          console.log(
            "Service command setupchannelcount not found. Stopping execution."
          );
          try {
            return await message.channel.send(
              "An internal error occured. Please try again later."
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

        console.log("Handing execution to setupchannelcount command.");
        serviceCommand.execute(message, con, args); // execute the commmand
        break;
      case "date":
        serviceCommand = serviceCommands.find((c) => c.slashCommand.name === "setupdate"); // get the channelcount command

        if (!serviceCommand) {
          // if the command does not exist
          console.log(
            "Service command setupdate not found. Stopping execution."
          );
          try {
            return await message.channel.send(
              "An internal error occured. Please try again later."
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

        console.log("Handing execution to setupdate command.");
        serviceCommand.execute(message, con, args); // execute the commmand
        break;
      case "membercount":
        serviceCommand = serviceCommands.find(
          (c) => c.slashCommand.name === "setupmembercount"
        ); // get the channelcount command

        if (!serviceCommand) {
          // if the command does not exist
          console.log(
            "Service command setupmembercount not found. Stopping execution."
          );
          try {
            return await message.channel.send(
              "An internal error occured. Please try again later."
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

        console.log("Handing execution to setupmembercount command.");
        serviceCommand.execute(message, con, args); // execute the commmand
        break;
      case "vcroles":
        serviceCommand = serviceCommands.find((c) => c.slashCommand.name === "setupvcroles"); // get the channelcount command

        if (!serviceCommand) {
          // if the command does not exist
          console.log(
            "Service command setupvcroles not found. Stopping execution."
          );
          try {
            return await message.channel.send(
              "An internal error occured. Please try again later."
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
        console.log("Handing execution to setupvcroles command.");
        serviceCommand.execute(message, con, args); // execute the commmand
        break;
      default:
        // in case there is no valid service provided
        try {
          console.log("No valid service was given. Stopping execution.");
          return await message.channel.send(
            "Invalid service. See f!services for valid services to setup."
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
  },
};

export = command; // export the command to the main module
