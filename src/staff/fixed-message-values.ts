import { Client, EmbedBuilder, Interaction, TextChannel } from 'discord.js';

// Crie o embed
export const tabelaPrecosEmbed = async (client: Client, interaction: Interaction) => { 

    if (!interaction.isCommand() || interaction.commandName !== 'values') return;

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
    .setColor('#00FF00') // Cor da borda do embed (verde)
    .setTitle('TABELA DE PREÇOS 🪙')
    .setDescription(
        'Valor Aposta: 1,25  |  Pagamento: 2,00\n' +
        'Valor Aposta: 2,25  |  Pagamento: 4,00\n' +
        'Valor Aposta: 3,25  |  Pagamento: 6,00\n' +
        'Valor Aposta: 5,25  |  Pagamento: 10,00\n' +
        'Valor Aposta: 10,25 |  Pagamento: 20,00\n' +
        'Valor Aposta: 15,25 |  Pagamento: 30,00\n' +
        'Valor Aposta: 20,25 |  Pagamento: 40,00\n' +
        'Valor Aposta: 50,25 |  Pagamento: 100,00\n' +
        'Valor Aposta: 100,25|  Pagamento: 200,00'
    );

    const sentMessage = await channel.send({ embeds: [embed] });
    await interaction.reply({ content: 'Mensagem fixa enviada com sucesso!', ephemeral: true });
}