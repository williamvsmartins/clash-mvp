import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { Client } from 'discord.js';
import config from '../config';

const { guildId, discordToken } = config;

export const registerCommands = async (client: Client): Promise<void> => {
  const commands = [
    {
      name: 'sendfixmessage',
      description: 'Envia a mensagem fixa com o botão para adicionar tag do Clash Royale',
    },
    {
      name: 'pix',
      description: 'Envia a mensagem fixa com o botão para gerar Pix'
    },
    {
      name: 'fila',
      description: 'Envia a mensagem fixa com o botão para entrar na fila'
    }
  ];

  const rest = new REST({ version: '9' }).setToken(discordToken!);

  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationGuildCommands(client.user!.id, guildId),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
};
