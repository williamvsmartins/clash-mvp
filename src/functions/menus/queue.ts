import { settings } from "#settings";
import { createRow, hexToRgb } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";

export function queueMenu(amountPay: string, amountReceive: string){

  const embed = new EmbedBuilder({
    title: "1v1 Clássico | Fila de Competição",
    color: hexToRgb(settings.colors.azoxo),
    description: `Formato\n1v1 Clássico\n\n`,
    fields: [
      { name: 'Valor', value: `R$ ${amountPay} / R$ ${amountReceive}\n\n`, inline: false },
      { name: 'Jogadores', value: 'Nenhum jogador na fila \n\n', inline: false },
    ],
    footer: { text: 'Clash Bet' },
    thumbnail : {url: 'https://cdn.discordapp.com/attachments/1276274460449575021/1276275081722593359/clashBet.jpg?ex=66c8ef4b&is=66c79dcb&hm=1fdd0951cc8461bb6585478dea0badaace2e018428cbe1fe761edc3c70271cb2&'}
  });

  const row = createRow(
    new ButtonBuilder({
        customId: "enter_queue",
        label: "Entrar na Fila",
        style: ButtonStyle.Success,
        emoji: "✅"
    }),

    new ButtonBuilder({
      customId: "leave_queue",
      label: "Sair da Fila",
      style: ButtonStyle.Danger,
      emoji: "📤"
    })
  );

  return { embed, row };
}