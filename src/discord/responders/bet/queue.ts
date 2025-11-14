import { Responder, ResponderType } from "#base";
import { reply, betMenu, getMoney } from "#functions";
import { ChannelType, PermissionFlagsBits, EmbedBuilder } from "discord.js";

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

    const fieldValue = message.embeds[0]?.fields[1]?.value || "";
    let members = fieldValue
      .split("\n")
      .map(v => v.trim().replace(/<@|>/g, ""))
      .filter(member => /^\d+$/.test(member));

    const memberId = member.id;

    if (members.includes(memberId)) {
      reply.danger({
        interaction,
        text: "Você já está na fila!"
      });
      return;
    }

    const valorField = message.embeds[0]?.fields[0]?.value || "R$ 0,00 / R$ 0,00";

    const [amountPayStr, amountReceiveStr] = valorField
      .split(" / ")
      .map(v => v.trim());

    const cleanedAmountPay = amountPayStr
      .replace(/[^\d,.-]/g, '')
      .replace(/\./g, '')
      .replace(',', '.');


    const amountPayCents = Math.round(parseFloat(cleanedAmountPay) * 100);

    if (isNaN(amountPayCents) || amountPayCents <= 0) {
      console.error('❌ Erro ao converter valor:', {
        valorField,
        amountPayStr,
        cleanedAmountPay,
        amountPayCents
      });

      reply.danger({
        interaction,
        text: "Erro ao processar o valor da aposta. Entre em contato com o suporte."
      });
      return;
    }

    const saldo = await getMoney(memberId);

    if (saldo < amountPayCents) {
    // if (saldo < 0) {
      reply.danger({
        interaction,
        text: `Saldo insuficiente! Seu saldo atual é de R$ ${(saldo / 100).toFixed(2).replace('.', ',')}`
      });
      return;
    }

    members.push(memberId);

    if (members.length >= 2) {
      const [user1, user2] = members;

      try {
        await interaction.update(betMenu(amountPayStr, amountReceiveStr, []));

        const timestamp = Date.now().toString().slice(-6);
        const channel = await guild!.channels.create({
          name: `aposta-${timestamp}`,
          type: ChannelType.GuildText,
          permissionOverwrites: [
            {
              id: guild!.roles.everyone,
              deny: [PermissionFlagsBits.ViewChannel],
            },
            {
              id: user1,
              allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.ReadMessageHistory,
              ],
            },
            {
              id: user2,
              allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.ReadMessageHistory,
              ],
            },
          ],
        });

        console.log('💾 Salvando dados da partida:', {
          channelId: channel.id,
          user1,
          user2,
          price: amountPayCents,
          priceInReais: (amountPayCents / 100).toFixed(2)
        });

        matchData.set(channel.id, {
          user1,
          user2,
          price: amountPayCents
        });

        const matchEmbed = new EmbedBuilder()
          .setColor(0x00FF00)
          .setTitle('🎮 Partida Criada!')
          .setDescription(
            `**Jogadores:**\n` +
            `<@${user1}> VS <@${user2}>\n\n` +
            `**Valor da Aposta:** R$ ${(amountPayCents / 100).toFixed(2).replace('.', ',')}\n` +
            `**Valor do Prêmio:** R$ ${(amountPayCents * 2 / 100).toFixed(2).replace('.', ',')}\n\n` +
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
                {
                  type: 2,
                  style: 1,
                  label: 'Aceitar',
                  customId: 'bet/match/accept'
                },
                {
                  type: 2,
                  style: 4,
                  label: 'Cancelar',
                  customId: 'bet/match/cancel'
                }
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

        await interaction.update(betMenu(amountPayStr, amountReceiveStr, []));

        await interaction.followUp({
          content: 'Erro ao criar canal da partida. Tente novamente.',
          ephemeral: true
        });
      }

      return;
    }

    await interaction.update(betMenu(amountPayStr, amountReceiveStr, members));
  },
});

new Responder({
  customId: "bet/queue/leave_bet",
  type: ResponderType.Button,
  cache: "cached",
  async run(interaction) {
    const { member, message } = interaction;
    const memberId = member.id;

    const valorField = message.embeds[0]?.fields[0]?.value || "R$ 0,00 / R$ 0,00";
    const [amountPay, amountReceive] = valorField
      .split(" / ")
      .map(v => v.trim());

    const fieldValue = message.embeds[0]?.fields[1]?.value || "";
    let members = fieldValue
      .split("\n")
      .map(v => v.trim().replace(/<@|>/g, ""))
      .filter(id => /^\d+$/.test(id));

    if (!members.includes(memberId)) {
      reply.danger({
        interaction,
        text: "Você não está na fila!"
      });
      return;
    }

    members = members.filter(id => id !== memberId);

    await interaction.update(betMenu(amountPay, amountReceive, members));
  },
});
