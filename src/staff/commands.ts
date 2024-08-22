import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { Client } from 'discord.js';
import config from '../../config';

const { guildId, discordToken } = config;

export const registerCommands = async (client: Client): Promise<void> => {
  const commands = [
    {
      name: 'registro',
      description: 'Envia a mensagem fixa com o botão para adicionar tag do Clash Royale',
      options: [
        {
          name: 'canal',
          description: 'O ID do canal onde a mensagem será fixada',
          type: 7, // 7 representa um canal no Discord (CHANNEL)
          required: true
        }
      ]
    },
    {
      name: 'pix',
      description: 'Envia a mensagem fixa com o botão para gerar Pix'
    },
    {
      name: 'fila',
      description: 'Cria nova fila de apostas',
      options: [
        {
          name: 'valor',
          description: 'Valor em reais para a fila',
          type: 4, // 4 representa um número inteiro
          required: true
        },
        {
          name: 'canal',
          description: 'O ID do canal onde a mensagem será enviada',
          type: 7, // 7 representa um canal no Discord (CHANNEL)
          required: true
        }
      ]
    },
    {
      name: 'carteira',
      description: 'Fixa os dados da carteira',
      options: [
        {
          name: 'canal',
          description: 'O ID do canal onde a mensagem será fixada',
          type: 7, // 7 representa um canal no Discord (CHANNEL)
          required: true
        }
      ]
    }, 
    {
      name: 'support',
      description: 'Fixa o embed para criar um suport',
      options: [
        {
          name: 'canal',
          description: 'O ID do canal onde a mensagem será fixada',
          type: 7, // 7 representa um canal no Discord (CHANNEL)
          required: true
        }
      ]
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
