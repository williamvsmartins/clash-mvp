import { ActionRowBuilder, EmbedBuilder, StringSelectMenuBuilder, TextChannel } from "discord.js";


export const embedFinishSuport = async (channel: TextChannel) => {
    const embed = new EmbedBuilder()
    .setColor('#2F3136')
    .setTitle('📞 Suporte')
    .setDescription('Finalize sua solicitação:')

    const row = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('finish_select')
                .setPlaceholder('Selecione o ticket que deseja abrir.')
                .addOptions([
                    {
                        label: 'FINALIZAR',
                        description: 'Clique aqui para finalizar o suporte',
                        value: 'finish',
                        emoji: '✔️',
                    },
                ]),
        );
    

    await channel.send({ embeds: [embed], components: [row] })
}