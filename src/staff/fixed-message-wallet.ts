import { TextChannel, Client, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import config from '../../config';
import { Guild } from '../database';

export const setupFixedMessageWalle = async (client: Client): Promise<void> => {
  client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand() || interaction.commandName !== 'carteira') return;

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
          .setCustomId('deposito')
          .setLabel('Depositar')
          .setStyle(ButtonStyle.Primary),
        
          new ButtonBuilder()
            .setCustomId('saldo')
            .setLabel('Saldo')
            .setStyle(ButtonStyle.Success),
        
        new ButtonBuilder()
            .setCustomId('sacar')
            .setLabel('Sacar')
            .setStyle(ButtonStyle.Secondary)
          
      );

    const sentMessage = await channel.send({ content: 'Selecione a operacao que deseja realizar:', components: [row] });
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
