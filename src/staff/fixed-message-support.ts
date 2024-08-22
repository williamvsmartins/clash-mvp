import { ActionRowBuilder, Client, EmbedBuilder, Interaction, StringSelectMenuBuilder, TextChannel } from "discord.js";
import { Guild } from '../db/database';


export const fixedMessageSuport = async (client: Client, interaction: Interaction) => {
    if (!interaction.isCommand() || interaction.commandName !== 'support') return;

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

    const embed = new EmbedBuilder()
    .setColor('#2F3136')
    .setTitle('📞 Suporte')
    .setDescription('Selecione o ticket de suporte que deseja abrir:')
    .setFooter({ text: 'OBS: Caso abra o ticket referente ao assunto errado será fechado!' });

    const row = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('ticket_select')
                .setPlaceholder('Selecione o ticket que deseja abrir.')
                .addOptions([
                    {
                        label: 'DENÚNCIA',
                        description: 'Clique aqui para abrir um ticket de denuncia',
                        value: 'denuncia',
                        emoji: '⚠️',
                    },
                    {
                        label: 'PAGAMENTO ERRADO',
                        description: 'Clique aqui para abrir um ticket sobre pagamento errado de aposta',
                        value: 'refund',
                        emoji: '💰',
                    },
                ]),
        );
    

    const sentMessage = await channel.send({ embeds: [embed], components: [row] });
    const fixedMessageId = sentMessage.id;

    await saveFixedMessageId(guildId, fixedMessageId);

    await interaction.reply({ content: 'Mensagem fixa enviada com sucesso!', ephemeral: true });

}

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