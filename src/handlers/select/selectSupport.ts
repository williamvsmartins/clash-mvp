import { Interaction, PermissionsBitField, TextChannel } from "discord.js";
import  config  from "../../../config";
import { embedFinishSuport } from "../../embed/embed-finish-suport";

const { suportroleid } = config;

export const selectSupport = async (interaction: Interaction) => {
    if(interaction.isStringSelectMenu()){
        const id = interaction.values[0];

        const channel = interaction.channel as TextChannel;

        const category = channel.parent;
        if (!category) {
            await interaction.reply({ content: 'Não foi possível encontrar a categoria do canal.', ephemeral: true });
            return;
        }

        let channelName = '';
        if (id === 'denuncia') {
            channelName = `denuncia-${interaction.user.username}`;
        } else if (id === 'refund') {
            channelName = `reembolso-${interaction.user.username}`;
        } else if (id === 'duvid'){
            channelName = `duvida-${interaction.user.username}`
        }

        const privateChannel = await category.guild.channels.create({
            name: channelName,
            type: 0, 
            parent: category.id,
            permissionOverwrites: [
                {
                    id: category.guild.id,
                    deny: [PermissionsBitField.Flags.ViewChannel],
                },
                {
                    id: interaction.user.id,
                    allow: [
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.SendMessages,
                        PermissionsBitField.Flags.ReadMessageHistory,
                    ],
                },
                {
                    id: '1270743659289247755', // ID DEV
                    allow: [
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.SendMessages,
                        PermissionsBitField.Flags.ReadMessageHistory,
                    ],
                },
            ],
        });

        await interaction.reply({ content: `Canal privado criado: ${privateChannel}`, ephemeral: true });
        await embedFinishSuport(privateChannel);
    }
}