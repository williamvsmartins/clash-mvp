import { settings } from "#settings";
import { createEmbedAuthor, hexToRgb } from "@magicyan/discord";
import { AutocompleteInteraction, EmbedBuilder, EmbedData, Guild, Interaction, User } from "discord.js";

interface ReplyOptions {
    interaction: Exclude<Interaction, AutocompleteInteraction>,
    text?: string;
    embeds?: (EmbedBuilder | EmbedData)[];
    ephemeral?: boolean;
    update?: boolean;
    clear?: boolean;
    content?: string;
}

interface EmbedReplyOptions extends ReplyOptions {
    color: string
    embed?: EmbedData
}

export function embedReply({ interaction, text, embeds: providedEmbeds, ...options }: EmbedReplyOptions){
    const { ephemeral = true, update = false, color, embed: data, clear, content } = options;

    let embeds: EmbedBuilder[];

    if (providedEmbeds) {
        // Se embeds foram fornecidos, garanta que todos sejam EmbedBuilders
        embeds = providedEmbeds.map(e => e instanceof EmbedBuilder ? e : new EmbedBuilder(e));
    } else {
        // Se não, crie um novo embed a partir do texto
        embeds = [
            new EmbedBuilder({
                color: hexToRgb(color),
                description: text,
                ...data
            })
        ];
    }

    const components = clear ? [] : undefined;
    const replyOptions = { content, embeds, components, ephemeral };
    const updateOptions = { content, embeds, components };

    if (update){
        if (interaction.isMessageComponent()){
            interaction.update(updateOptions);
            return;
        }
        if (interaction.deferred || interaction.replied) {
            interaction.editReply(updateOptions);
            return;
        }
    }
    
    // Assegurando que a interação pode receber uma resposta
    if (!interaction.replied){
        interaction.reply(replyOptions);
    }
}

// O resto do seu código permanece o mesmo
export const reply = {
    success(options: ReplyOptions){
        embedReply({
            color: settings.colors.success,
            clear: true, ...options,
        });
    },
    danger(options: ReplyOptions){
        embedReply({
            color: settings.colors.danger,
            clear: true, ...options,
        });
    },
    primary(options: ReplyOptions){
        embedReply({
            color: settings.colors.primary,
            clear: true, ...options,
        });
    },
    server({ guild, ...options}: ReplyOptions & { guild: Guild }){
        embedReply({
            color: settings.colors.primary,
            clear: true,
            embed: {
                footer: {
                    text: guild.name,
                    iconURL: guild.iconURL() ?? undefined
                }
            },
            ...options,
        });
    },
    user({ user, ...options}: ReplyOptions & { user: User }){
        embedReply({
            color: settings.colors.primary,
            clear: true,
            embed: {
                author: createEmbedAuthor(user)
            },
            ...options,
        });
    }
};