import { hexToRgb } from "@magicyan/discord";
import { EmbedBuilder } from "discord.js";

export function rulesMenu() {
  const embed = new EmbedBuilder({
    title: "Regras",
    color: hexToRgb("#2ecc71"),
    description: [
      `⏳ **Tempo do "GO":** Os jogadores têm 4 minutos para iniciar a partida.`,
      ``,
      `🔄 **Refazer sala:** É permitido refazer a sala a qualquer momento durante a partida, com o custo de **R$ 1,00.**`,
      ``,
      `**Aleatórios na sala:** Se iniciar a partida com aleatórios na sala, ambos os adversários pagam a sala.`,
      ``,
      `🔄 **Escolha incorreta:** Em caso de escolha incorreta de personagens ou pets, é necessário refazer até o final do 2º round ou resultará em w.o (Os rounds jogados serão dados para o adversário).`,
      ``,
      `⏳ **Você tem até 3 minutos para se preparar:** Antes de entrar na sala, escolha seus personagens e pets permitidos para que o mediador não comece o jogo sem você estar pronto. Quando os dois times estiverem completos, o mediador vai esperar alguns segundos e começar a partida para não atrasar as outras pessoas na fila. Se os dois slots ficarem completos antes dos 5 minutos, a partida vai começar em poucos segundos mesmo assim.`,
      ``,
      `🕐 **Regra de tempo:**`,
      ``,
      `Mínimo: 3 minutos (obrigatório esperar)`,
      `Máximo: 5 minutos (se todos estiverem prontos na sala)`,
      ``,
      `**Atenção:** O mediador só pode iniciar a partida depois de pelo menos 3 minutos — esse é o tempo mínimo obrigatório.`,
    ].join("\n"),
    footer: { text: "Clash Bet" },
  });

  return { embeds: [embed] };
}
