import { ChannelType, Client, Guild, Interaction, TextChannel } from 'discord.js';
import { updateQueueEmbed } from '../../embed/updateQueueEmbed';

import { getMoney } from '../../db/getMoneys';
import { embedConfPlay } from '../../embed/embed-Confirm-PLay';
import { confirmacoes } from './buttonsConfirmBet';
import { deleteChannel } from '../../match/deleteChannel';

export const setupQueueManager = async (client: Client, interaction: Interaction) => {

  if (!interaction.isButton()) return;

  const userId = interaction.user.id;
  let queue: string[];
  const messageId = interaction.message.id;
  const apostaId = messageId;
  const channelId = interaction.message.channelId;

  if (interaction.customId === 'enter_queue') {
      queue = filas.get(apostaId) || [];

      const queueLenghth = queue.length;

      const priceString = interaction.message.embeds[0].data.fields![0].value;
      const cleanedPriceString = priceString.replace(/[^\d,.-]/g, '').replace(',', '.'); 
      const priceInReais = parseFloat(cleanedPriceString);
      const priceInCents = Math.round(priceInReais * 100);

      const saldo = await getMoney(userId);

      if (queue.includes(userId)) {
          await interaction.reply({ content: 'Você já está na fila!', ephemeral: true });
          return;
      }
      if(queueLenghth < 1){
        queue = addToQueue(apostaId, userId);
        await interaction.deferUpdate();

        if (priceInCents > saldo) {
          removeFromQueue(apostaId, userId);
          await interaction.followUp({ content: `Saldo insuficiente para esta aposta, seu saldo atual é de:  ${(saldo / 100).toFixed(2).replace('.', ',')}`, ephemeral: true });
          return;
        }

        await updateQueueEmbed(channelId, messageId, apostaId, client);
      } else {
          if(saldo >= priceInCents){
            await interaction.deferUpdate();
            const [user1] = queue;
            const user2 = userId;
            await createChannelForUsers(client, interaction.guild!, channelId, messageId, apostaId, user1, user2, priceInCents);
        } else{
          await interaction.deferUpdate();
          await interaction.followUp({ content: `Saldo insuficiente para esta aposta, seu saldo atual é de:  ${(saldo / 100).toFixed(2).replace('.', ',')}`, ephemeral: true });
          return;
        }
      }

  } else if (interaction.customId === 'leave_queue') {
      queue = filas.get(apostaId) || [];

      if (queue.includes(userId)) {
          queue = removeFromQueue(apostaId, userId);

          await updateQueueEmbed(channelId, messageId, apostaId, client);

      } else {
          await interaction.reply({ content: 'Você não está na fila!', ephemeral: true });
      }
  }

  if (!interaction.replied && !interaction.deferred) {
    try{
      await interaction.deferUpdate();
    } catch(error){
      console.log(`Erro ao tentar deferUpdate: ${error}`)
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

  removeFromQueue(apostaId, user1);

  await updateQueueEmbed(channelId, messageId, apostaId, client); //pesado pra caralho
    
  const channel = await guild.channels.create({
    name: `aposta-${user1}-${user2}-${apostaId}`,
    type: ChannelType.GuildText,
    parent: '1276246472249049150',
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
  
  confirmacoes.set(`${channel.id}`, []);
  
  await channel.send(`Bem-vindos, <@${user1}> e <@${user2}>! Este é o seu canal privado.`);
  
  await channel.send(embedConfPlay(price));
  
  // Inicia o temporizador de 5 minutos
  const timeout = setTimeout(async () => {
    if (confirmacoes.get(channel.id)?.length! < 2) {
      await channel.send("Tempo esgotado! Aposta não confirmada, canal será excluído.");
      confirmacoes.delete(channel.id);
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
