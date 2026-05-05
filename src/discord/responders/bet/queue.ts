import { Responder, ResponderType } from "#base";
import { reply, betMenu, getBalance, scheduleQueueNotification, cancelQueueNotification } from "#functions";
import { PendingMatch } from "#database";
import { ChannelType, PermissionFlagsBits, EmbedBuilder, TextChannel } from "discord.js";
import { calcularPremio } from "#settings";

export const matchData = new Map<string, {
  user1: string;
  user2: string;
  price: number;
}>();

new Responder({
  customId: "bet/queue/enter_bet",
  type: ResponderType.Button,
  cache: "cached",
  async run(interaction) {
    const { member, message, guild } = interaction;

    const fieldValue = message.embeds[0]?.fields?.[1]?.value;
    if (!fieldValue) {
      reply.danger({ interaction, text: "Erro ao ler os dados da fila. Tente novamente." });
      return;
    }
    let members = fieldValue
      .split("\n")
      .map(v => v.trim().replace(/<@|>/g, ""))
      .filter(member => /^\d+$/.test(member));

    const memberId = member.id;

    if (members.includes(memberId)) {
      reply.danger({ interaction, text: "Você já está na fila!" });
      return;
    }

    const valorField = message.embeds[0]?.fields?.[0]?.value ?? "R$ 0,00 / R$ 0,00";
    const parts = valorField.split(" / ").map(v => v.trim());

    const toFloat = (s: string) =>
      parseFloat(s.replace(/[^\d,]/g, '').replace(',', '.'));

    const amountPayCents = Math.round(toFloat(parts[0] ?? "0") * 100);
    const amountReceiveCents = Math.round(toFloat(parts[1] ?? "0") * 100);

    if (isNaN(amountPayCents) || amountPayCents <= 0) {
      reply.danger({ interaction, text: "Erro ao processar o valor da aposta. Entre em contato com o suporte." });
      return;
    }

    const saldo = await getBalance(memberId);

    if (saldo < amountPayCents) {
      reply.danger({
        interaction,
        text: `Saldo insuficiente! Seu saldo atual é de R$ ${(saldo / 100).toFixed(2).replace('.', ',')}`
      });
      return;
    }

    members.push(memberId);

    if (members.length >= 2) {
      const [user1, user2] = members;

      cancelQueueNotification(message.id);

      try {
        await interaction.update(betMenu(amountPayCents, amountReceiveCents, []));

        const timestamp = Date.now().toString().slice(-6);
        const channel = await guild!.channels.create({
          name: `aposta-${timestamp}`,
          type: ChannelType.GuildText,
          permissionOverwrites: [
            { id: guild!.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
            { id: user1, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
            { id: user2, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
          ],
        });

        matchData.set(channel.id, { user1, user2, price: amountPayCents });

        await PendingMatch.create({ channelId: channel.id, user1, user2, price: amountPayCents });

        const { premioVencedor } = calcularPremio(amountPayCents * 2);
        const fmtR = (c: number) => `R$ ${(c / 100).toFixed(2).replace('.', ',')}`;

        const matchEmbed = new EmbedBuilder()
          .setColor(0x00FF00)
          .setTitle('🎮 Partida Criada!')
          .setDescription(
            `**Jogadores:**\n` +
            `<@${user1}> VS <@${user2}>\n\n` +
            `**Valor da Aposta:** ${fmtR(amountPayCents)}\n` +
            `**Prêmio do Vencedor:** ${fmtR(premioVencedor)}\n\n` +
            `⚠️ **Ambos os jogadores devem clicar em "Aceitar" para confirmar a partida!**\n\n` +
            `Após a confirmação, vocês poderão enviar o link do Clash Royale.`
          )
          .setFooter({ text: 'ClashBet • Boa sorte!' })
          .setTimestamp();

        await channel.send({
          content: `<@${user1}> <@${user2}>`,
          embeds: [matchEmbed],
          components: [
            {
              type: 1,
              components: [
                { type: 2, style: 1, label: 'Aceitar', customId: 'bet/match/accept' },
                { type: 2, style: 4, label: 'Cancelar', customId: 'bet/match/cancel' }
              ]
            }
          ]
        });

        await interaction.followUp({
          content: `✅ Partida criada! <@${user1}> e <@${user2}>, acessem ${channel} para continuar.`,
          ephemeral: true
        });

      } catch (error) {
        console.error('Erro ao criar canal:', error);
        await interaction.update(betMenu(amountPayCents, amountReceiveCents, []));
        await interaction.followUp({
          content: 'Erro ao criar canal da partida. Tente novamente.',
          ephemeral: true
        });
      }

      return;
    }

    await interaction.update(betMenu(amountPayCents, amountReceiveCents, members));

    if (members.length === 1 && message.channel.isTextBased() && 'send' in message.channel) {
      void scheduleQueueNotification(interaction.client, message.channel as TextChannel, message.id, memberId, amountPayCents, interaction.guildId!);
    }
  },
});

new Responder({
  customId: "bet/queue/leave_bet",
  type: ResponderType.Button,
  cache: "cached",
  async run(interaction) {
    const { member, message } = interaction;
    const memberId = member.id;

    const valorField = message.embeds[0]?.fields?.[0]?.value ?? "R$ 0,00 / R$ 0,00";
    const parts = valorField.split(" / ").map(v => v.trim());

    const toFloat = (s: string) =>
      parseFloat(s.replace(/[^\d,]/g, '').replace(',', '.'));

    const amountPayCents = Math.round(toFloat(parts[0] ?? "0") * 100);
    const amountReceiveCents = Math.round(toFloat(parts[1] ?? "0") * 100);

    const fieldValue = message.embeds[0]?.fields?.[1]?.value;
    let members = fieldValue
      ? fieldValue.split("\n").map(v => v.trim().replace(/<@|>/g, "")).filter(id => /^\d+$/.test(id))
      : [];

    if (!members.includes(memberId)) {
      reply.danger({ interaction, text: "Você não está na fila!" });
      return;
    }

    members = members.filter(id => id !== memberId);

    if (members.length === 0) {
      cancelQueueNotification(message.id);
    }

    await interaction.update(betMenu(amountPayCents, amountReceiveCents, members));
  },
});
