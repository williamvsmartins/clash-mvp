import { settings } from "#settings";
import { createEmbedAuthor, hexToRgb } from "@magicyan/discord";
import { AutocompleteInteraction, EmbedBuilder, EmbedData, Guild, Interaction, User } from "discord.js";

interface ReplyOptions {
    interaction: Exclude<Interaction, AutocompleteInteraction>,
    text: string;
    ephemeral?: boolean;
    update?: boolean;
    clear?: boolean;
    content?: string;
}

interface EmbedReplyOptions extends ReplyOptions {
    color: string
    embed?: EmbedData
}
export function embedReply({ interaction, text, ...options }: EmbedReplyOptions){
    const { ephemeral=true, update=false, color, embed: data, clear, content } = options;

    const embed = new EmbedBuilder({
        color: hexToRgb(color),
        description: text, 
        ...data
    });

    const components = clear ? [] : undefined;

    if (update){
        if (interaction.isMessageComponent()){
            interaction.update({ content, embeds: [embed], components });
            return;
        }
        interaction.editReply({ content, embeds: [embed], components });
        return;
    }

    interaction.reply({ ephemeral, embeds: [embed], content });
}

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