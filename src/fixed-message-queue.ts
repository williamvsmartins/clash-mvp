import { TextChannel, Client, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import config from '../config';
import { Guild } from './database';

const { channelId } = config;

export const setupFixedMessageQueue = async (client: Client): Promise<void> => {
  client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand() || interaction.commandName !== 'fila') return;

    const channel = await client.channels.fetch(channelId);
    if (!channel || !(channel instanceof TextChannel)) return;

    const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('2v2 | Fila de Competição')
        .setDescription('Formato\n2v2 Misto\n\nValor\nR$ 3,00')
        .addFields([
          { name: 'Jogadores', value: 'Nenhum jogador na fila \n\n1 emulador', inline: false }
        ])
        .setThumbnail('https://p2.trrsf.com/image/fget/cf/774/0/images.terra.com/2024/02/05/297180513-040224-01.jpg')
        .setFooter({ text: 'Moreira Apostas' });

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('enter_queue')
          .setLabel('Entrar na Fila')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('leave_queue')
          .setLabel('Sair da Fila')
          .setStyle(ButtonStyle.Danger)
      );
    

    const sentMessage = await channel.send({ content: 'Clique no botão abaixo para entrar na fila:', embeds: [embed], components: [row] });
    const fixedMessageId = sentMessage.id;

    // Salvar o ID da mensagem fixa no banco de dados
    await saveFixedMessageId('1271162783781748807', fixedMessageId);

    await interaction.reply({ content: 'Mensagem fixa enviada com sucesso!', ephemeral: true });
  });
};

async function saveFixedMessageId(guildId: string, fixedMessageId: string): Promise<void> {
  try {
    const existingGuild = await Guild.findOne({ guildId });

    if (existingGuild) {
      existingGuild.fixedMessageId = fixedMessageId;
      await existingGuild.save();
    } else {
      await Guild.create({
        guildId,
        fixedMessageId,
      });
    }
  } catch (error) {
    console.error('Erro ao salvar o ID da mensagem fixa:', error);
  }
}
