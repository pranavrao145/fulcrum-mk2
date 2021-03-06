import { Message } from "discord.js";
import { ICommand } from "../../../utils/types";
import { Client } from "pg";
import { promisify } from "util";
import glob from "glob";

const command: ICommand = {
  name: "update",
  description:
    "Updates the service specified. See f!services for a full list of services that Fulcrum offers.",
  alias: ["u"],
  syntax: "f!update [service]",
  async execute(message: Message, con: Client, args?: string[]) {
    console.log(
      `Command update started by user ${message.member!.user.tag} in guild ${
        message.guild!.name
      }.`
    );

    if (!args || args.length === 0 || args.length > 1) {
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

    const service = args.shift(); // try to get the service the user wants to update

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
      service // check for different services to update
    ) {
      case "channelcount":
        serviceCommand = serviceCommands.find(
          (c) => c.name === "updatechannelcount"
        ); // get the channelcount command

        if (!serviceCommand) {
          // if the command does not exist
          console.log(
            "Service command updatechannelcount not found. Stopping execution."
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

        console.log("Handing execution to updatechannelcount command.");
        serviceCommand.execute(message, con, args); // execute the commmand
        break;
      case "date":
        serviceCommand = serviceCommands.find((c) => c.name === "updatedate"); // get the channelcount command

        if (!serviceCommand) {
          // if the command does not exist
          console.log(
            "Service command updatedate not found. Stopping execution."
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

        console.log("Handing execution to updatedate command.");
        serviceCommand.execute(message, con, args); // execute the commmand
        break;
      case "membercount":
        serviceCommand = serviceCommands.find(
          (c) => c.name === "updatemembercount"
        ); // get the channelcount command

        if (!serviceCommand) {
          // if the command does not exist
          console.log(
            "Service command updatemembercount not found. Stopping execution."
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

        console.log("Handing execution to updatemembercount command.");
        serviceCommand.execute(message, con, args); // execute the commmand
        break;
      case "vcroles":
        serviceCommand = serviceCommands.find(
          (c) => c.name === "updatevcroles"
        ); // get the channelcount command

        if (!serviceCommand) {
          // if the command does not exist
          console.log(
            "Service command updatevcroles not found. Stopping execution."
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
        console.log("Handing execution to updatevcroles command.");
        serviceCommand.execute(message, con, args); // execute the commmand
        break;
      default:
        // in case there is no valid service provided
        try {
          console.log("No valid service was given. Stopping execution.");
          return await message.channel.send(
            "Invalid service. See f!services for valid services to update."
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
