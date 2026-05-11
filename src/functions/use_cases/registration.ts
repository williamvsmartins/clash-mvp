import { ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import type { ButtonInteraction, ModalSubmitInteraction } from 'discord.js';
import { User } from '#database';

type SupportedInteraction = ButtonInteraction<'cached'> | ModalSubmitInteraction<'cached'>;

/**
 * Verifica se o usuário tem cadastro (clashTag). Se não tiver, responde com
 * instrução para se registrar e retorna false. Retorna true se cadastrado.
 */
export async function requireRegistration(interaction: SupportedInteraction): Promise<boolean> {
    const user = await User.findOne({ userId: interaction.user.id, clashTag: { $exists: true, $ne: null } });

    if (!user?.clashTag) {
        const registerButton = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId('add_tag')
                .setLabel('Criar cadastro')
                .setStyle(ButtonStyle.Primary),
        );

        await interaction.reply({
            content: [
                '❌ | Você precisa ter um cadastro para usar esta função.',
                '',
                'Clique no botão abaixo para vincular sua conta do Clash Royale e liberar acesso à carteira e às filas.',
            ].join('\n'),
            components: [registerButton],
            ephemeral: true,
        });

        return false;
    }

    return true;
}
