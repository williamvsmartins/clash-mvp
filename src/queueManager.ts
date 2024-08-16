import { ChannelType, Client, Guild, TextChannel } from 'discord.js';
import { updateQueueEmbed } from './updateQueueEmbed';
import { embedConf } from './embed-Confirm-Cancel';
import { handleButtonsCon } from './buttonsConfirmCancel';


export const setupQueueManager = (client: Client): void => {
  client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    const userId = interaction.user.id;
    const apostaId = '1';

    let queue: string[];
    let messageId: string;
    
    if (interaction.customId === 'enter_queue') {
      messageId = interaction.message.id;

      queue = filas.get(apostaId) || [];
      
      if (queue.includes(userId)) {
        await interaction.reply({ content: 'Você já está na fila!', ephemeral: true });
        return;
      }
      
      queue = addToQueue(apostaId, userId);
      
      await updateQueueEmbed(messageId, apostaId, client);

      if (queue.length >= 2) {
        const [user1, user2] = queue;
        await createChannelForUsers(client, interaction.guild!, messageId,apostaId, user1, user2);
      }
      try {
        await interaction.deferUpdate();
      } catch (error) {
        console.error('Erro ao tentar deferUpdate:', error);
      }
    } else if (interaction.customId === 'leave_queue') {
      messageId = interaction.message.id;
      queue = filas.get(apostaId) || [];

      if (!queue.includes(userId)) {
        await interaction.reply({ content: 'Você não está na fila!', ephemeral: true });
        return;
      }

      queue = removeFromQueue(apostaId, userId);

      await updateQueueEmbed(messageId, apostaId, client);
      interaction.deferUpdate()
    }
  });
};



export const filas = new Map<string, string[]>();

const addToQueue = (apostaId: string, userId: string): string[] => {
    if (!filas.has(apostaId)) {
        filas.set(apostaId, []);
    }

    const fila = filas.get(apostaId)!;
    fila.push(userId);

    return fila;
};

const createChannelForUsers = async (client: Client, guild: Guild, messageId: string, apostaId: string, user1: string, user2: string) => {
  const channel = await guild.channels.create({
    name: `aposta-${user1}-${user2}`,
    type: ChannelType.GuildText,
    permissionOverwrites: [
      {
        id: guild.roles.everyone,
        deny: ['ViewChannel'],
      },
      {
        id: user1,
        allow: ['ViewChannel'],
      },
      {
        id: user2,
        allow: ['ViewChannel'],
      },
    ],
  });
  
  removeFromQueue(apostaId, user1);
  removeFromQueue(apostaId, user2);
  await updateQueueEmbed(messageId, apostaId, client);

  
  await channel.send(`Bem-vindos, <@${user1}> e <@${user2}>! Este é o seu canal privado.`);
  
  // const [idTransition1, idTRansition2] = await Promise.all([
  //   setupPixGenerate(client, channel, user1),
  //   setupPixGenerate(client, channel, user2)
  // ]);

  const dateChannel = new Date(); //confere o horário após o pagamento, serve para verificar quando realmente comeca a considerar a partida


  // if(idTransition1 != '' && idTRansition2 != ''){

    // const [confirm1, confirm2] = await Promise.all([
    //   paymentChack(idTransition1, channel),
    //   paymentChack(idTRansition2, channel)
    // ])

    // if(confirm1 && confirm2){
      await channel.send('Ambos os pagamentos foram confirmados')

      await channel.send(embedConf())

      handleButtonsCon(client, user1, user2, channel, dateChannel);
    // }

  // }
};

const removeFromQueue = (apostaId: string, userId: string): string[] => {
  if (!filas.has(apostaId)) {
    return [];
  }

  const fila = filas.get(apostaId)!;
  const index = fila.indexOf(userId);
  if (index > -1) {
    fila.splice(index, 1);
  }

  return fila;
};
