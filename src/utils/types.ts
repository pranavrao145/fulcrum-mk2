import { SlashCommandBuilder } from "@discordjs/builders";
import { Message } from "discord.js";
import { Client } from "pg";

// interface for a bot command
export interface ICommand {
  slashCommand: SlashCommandBuilder;
  help: string;
  alias?: string[];
  syntax: string;
  execute(
    ...args:
      | [message: Message, _con: Client, args?: string[]]
      | [message: Message | any, _con: Client, args?: string[]]
  ): any;
}
