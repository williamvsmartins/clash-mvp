import { EmbedBuilder } from "discord.js";

// Função para criar a embed do comprovante de saque
export const createSaqueEmbed = (valorCentavos: number, pixKey: string, saldoAtual: number): EmbedBuilder => {
  return new EmbedBuilder()
    .setColor('#00FF00') // Cor verde para indicar sucesso
    .setTitle('💸 Comprovante de Saque 💸')
    .setDescription('Seu saque foi processado com sucesso! Confira os detalhes abaixo.')
    .addFields(
      { name: '💵 Valor Sacado', value: `R$ ${(valorCentavos / 100).toFixed(2).replace('.', ',')}`, inline: true },
      { name: '🔑 Chave PIX', value: pixKey || 'Pix não informado', inline: true },
      { name: '💰 Saldo Restante', value: `R$ ${(saldoAtual / 100).toFixed(2).replace('.', ',')}`, inline: true },
      { name: '🗓️ Data do Saque', value: new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }), inline: false }
    )
    .setFooter({ text: 'Obrigado por usar nosso sistema!', iconURL: 'https://cdn.discordapp.com/attachments/1276274460449575021/1276275081722593359/clashBet.jpg?ex=66cd8c8b&is=66cc3b0b&hm=6ca1520b66b10483a7355663e4fa8b16a4549cfb3731289576d170ad858f12d8&' })
    .setTimestamp();
};
