import { Command } from "#base";
import { reply } from "#functions";
import { limitText } from "@magicyan/discord";
import { ApplicationCommandType, ApplicationCommandOptionType, ChannelType, codeBlock, PermissionFlagsBits } from "discord.js";
import { betMenu } from "#functions";

new Command({
  name: "fila",
  description: "Cria nova fila de apostas",
  type: ApplicationCommandType.ChatInput,
  defaultMemberPermissions: [PermissionFlagsBits.Administrator],
  options: [{
    name: 'valor_pagar',
    description: 'Valor em reais para entrar na fila',
    type: ApplicationCommandOptionType.String,
    required
  },
  {
    name: "valor_receber",
    description: "Valor em reais a ser recebido",
    type: ApplicationCommandOptionType.String,
    required
  },
  {
    name: 'canal',
    description: 'O ID do canal onde a mensagem será enviada',
    type: ApplicationCommandOptionType.Channel,
    required
  }],
  async run(interaction) {
    const { member, options } = interaction;

    // Verificar se o usuário tem permissão de administrador
    if (!member.permissions.has(PermissionFlagsBits.Administrator)) {
      reply.danger({
        interaction,
        text: "Apenas administradores podem utilizar este comando!"
      });
      return;
    }

    const channel = options.getChannel("canal", true, [ChannelType.GuildText]);

    const amountPay = limitText(options.getString("valor_pagar", true), 10);
    const amountReceive = limitText(options.getString("valor_receber", true), 10);

    try {
      const { embeds, components } = betMenu(amountPay, amountReceive);
      const message = await channel.send({ embeds, components });

      reply.success({
        interaction,
        text: `Mensagem enviada com sucesso! ${message.url}`,
      });
    } catch (err) {
      reply.danger({
        interaction,
        text: `Não foi possível enviar a mensagem ${codeBlock("bash", err as string)}`,
      });
    }
  }
});