import { TextChannel, Client, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import config from '../../config';
import { Guild } from '../database';

export const setupFixedMessage = async (client: Client): Promise<void> => {
  client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand() || interaction.commandName !== 'registro') return;

    const { options } = interaction

    const guild = options.get('canal')

    if (!guild){
      interaction.editReply({
          content: "É necessário especificar o ID do canal!"
      });
      return;
    }

    const guildId = guild.value as string
    const channel = await client.channels.fetch(guildId);
    if (!channel || !(channel instanceof TextChannel)) return;

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('add_tag')
          .setLabel('Adicionar Tag do Clash Royale')
          .setStyle(ButtonStyle.Primary),
      );

    const sentMessage = await channel.send({ content: 'Clique no botão abaixo para adicionar sua tag do Clash Royale:', components: [row] });
    const fixedMessageId = sentMessage.id;

    await saveFixedMessageId(guildId, fixedMessageId);

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
