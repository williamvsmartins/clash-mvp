import { Responder, ResponderType } from "#base";
import { reply, betMenu } from "#functions";

new Responder({
  customId: "bet/queue/enter_bet",
  type: ResponderType.Button,
  cache: "cached",
  async run(interaction) {
    const { member, message } = interaction;
    let members = message.embeds[0].fields[1].value.split("\n").map(v => v.trim().replace("<@", "").replace(">", ""));
    members = members.filter(member => /^\d+$/.test(member));

    const memberId = member.id;

    if (members.includes(memberId)) {
      reply.danger({
        interaction,
        text: "Você já está na fila!"
      });
      return;
    }

    members.push(memberId);

    if (members.length >= 2) {
      reply.success({
        interaction,
        text: "🎉 Dois jogadores na fila! Criando chat privado para a partida!"
      });

      // Aqui você pode adicionar lógica para criar um canal privado
      // ou enviar mensagem para os jogadores
      members = [];
    } else {
      reply.success({
        interaction,
        text: "Você foi adicionado à fila! Aguardando outro jogador..."
      });
    }

    const [amountPay, amountReceive] = message.embeds[0].fields[0].value.split(" / ").map(v => v.trim().replace("R$ ", ""));

    interaction.update(betMenu(amountPay, amountReceive, members));
  },
});

new Responder({
  customId: "bet/queue/leave_bet",
  type: ResponderType.Button,
  cache: "cached",
  async run(interaction) {
    const { member, message } = interaction;
    const memberId = member.id;
    const [amountPay, amountReceive] = message.embeds[0].fields[0].value.split(" / ").map(v => v.trim().replace("R$ ", ""));

    let members = message.embeds[0].fields[1].value.split("\n").map(v => v.trim().replace("<@", "").replace(">", ""));

    if (!members.includes(memberId)) {
      reply.danger({
        interaction,
        text: "Você não está na fila!"
      });
      return;
    }

    members = members.filter(id => id !== memberId);

    interaction.update(betMenu(amountPay, amountReceive, members));
  },
});
