import { Client, Interaction, Message, TextChannel } from 'discord.js';
import { handleButtonsConfet } from './buttons/buttonsConfirmBet';
import { handleButtonsCon } from './buttons/buttonsConfirmCancel';
import { setupClashRoyaleForm } from './buttons/clashRoyaleForm';
import { setupQueueManager } from './buttons/queueManager';
import { buttonsWallet } from './buttons/buttons-wallet';

export const handleButtonInteraction = async (client: Client, interaction: Interaction) => {
  if (!interaction.isButton()) return;

  const id = interaction.customId;
  const channel = interaction.channel as TextChannel;

  if(id === 'Aceitar' || id === 'Cancel_inicio'){
        const channelNameParts = channel.name.split('-');  // Dividir o nome do canal
        const message = interaction.message; // Acessa a mensagem associada ao botão
      
        // Verifique se o nome do canal segue o formato esperado
        if (channelNameParts.length === 4 && channelNameParts[0] === 'aposta') {
            const user1 = channelNameParts[1];
            const user2 = channelNameParts[2];
            const apostaId = channelNameParts[3];
            handleButtonsConfet(client, interaction, user1, user2, channel, message)
        }
    }else if(id === 'Finalizar' || id === 'Cancelar'){
        const confirmation = pendingConfirmations.get(channel.id);
        if (typeof confirmation === 'undefined') {
            channel.send('indefinido')
        }else{
            handleButtonsCon(client, interaction, confirmation.user1, confirmation.user2, confirmation.channel, confirmation.date);
            pendingConfirmations.delete(channel.id); // Limpa a entrada após usar
        }
    } else if(id === 'add_tag'){
        setupClashRoyaleForm(client, interaction);
    } else if(id === 'enter_queue' || id === 'leave_queue'){
        setupQueueManager(client, interaction);
    }else if(id === 'deposito' || id === 'saldo' || id === 'sacar'){
        buttonsWallet(client, interaction);
    }

};

export const pendingConfirmations = new Map<string, {
    user1: string;
    user2: string;
    channel: TextChannel;
    message: Message;
    date: Date;
    price: number;
  }>();