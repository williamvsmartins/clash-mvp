import { ChannelType, Client, Guild, Interaction, TextChannel } from 'discord.js';
import { updateQueueEmbed } from '../../embed/updateQueueEmbed';

import { getMoney } from '../../db/getMoneys';
import { embedConfPlay } from '../../embed/embed-Confirm-PLay';
import { confirmacoes } from './buttonsConfirmBet';
import { deleteChannel } from '../../match/deleteChannel';

//precisa da observacap
export const setupQueueManager = async (client: Client, interaction: Interaction) => {

    if (!interaction.isButton()) return;
    
    const userId = interaction.user.id;

    let queue: string[];
    let messageId: string;
    messageId = interaction.message.id;
    const apostaId = messageId;
    const channelId = interaction.message.channelId

    if (interaction.customId === 'enter_queue') {
      queue = filas.get(apostaId) || [];
      
      if (queue.includes(userId)) {
        await interaction.reply({ content: 'Você já está na fila!', ephemeral: true });
        return;
      }
      //aqui
      const priceString = interaction.message.embeds[0].data.fields![0].value; // pegando indefinido?
      console.log(priceString)
      const cleanedPriceString = priceString.replace(/[^\d,.-]/g, '').replace(',', '.'); 
      const price = parseFloat(cleanedPriceString);

      const saldo = await getMoney(userId);

      if(price < saldo){
        queue = addToQueue(apostaId, userId);
        
        await updateQueueEmbed(channelId, messageId, apostaId, client);

        if (queue.length >= 2) {
          const [user1, user2] = queue;
          await createChannelForUsers(client, interaction.guild!, channelId, messageId, apostaId, user1, user2, price);
        }
      } else{
        await interaction.reply({ content: `saldo insuficiente para esta aposta, seu saldo atual é de: ${saldo}`, ephemeral: true })
      }
    } else if (interaction.customId === 'leave_queue') {
      messageId = interaction.message.id;
      queue = filas.get(apostaId) || [];

      if (queue.includes(userId)) {
        queue = removeFromQueue(apostaId, userId);
  
        await updateQueueEmbed(channelId, messageId, apostaId, client);
        
      } else{
        await interaction.reply({ content: 'Você não está na fila!', ephemeral: true });
      }
    }
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

const createChannelForUsers = async (client: Client, guild: Guild, channelId: string,
   messageId: string, apostaId: string, user1: string, user2: string, price: number) => {
    
  const channel = await guild.channels.create({
    name: `aposta-${user1}-${user2}-${apostaId}`,
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
  await updateQueueEmbed(channelId, messageId, apostaId, client);

  confirmacoes.set(`${channel.id}`, []);
  
  await channel.send(`Bem-vindos, <@${user1}> e <@${user2}>! Este é o seu canal privado.`);

  const message = await channel.send(embedConfPlay(price));

  // Inicia o temporizador de 5 minutos
  const timeout = setTimeout(async () => {
    if (confirmacoes.get(channel.id)?.length! < 2) {
        await channel.send("Tempo esgotado! Aposta não confirmada, canal será excluído.");
        await deleteChannel(channel);
    }
  }, 5 * 60 * 1000); // 5 minutos em milissegundos

  // Salva o timeout para cancelar se ambos confirmarem
  (channel as any).timeout = timeout;

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
