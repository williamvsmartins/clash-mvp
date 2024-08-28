import { Client, Interaction } from "discord.js";
import { selectSupport } from "./select/selectSupport";
import { selectFinish } from "./select/selectFinish";


export const handleSelectInteraction = async (client: Client, interaction: Interaction) => {
    if (!interaction.isStringSelectMenu()) return;

    const id = interaction.values[0];

    if(id === 'denuncia' || id === 'refund' || id === 'duvid'){
        selectSupport(interaction);
    } else if(id === 'finish'){
        selectFinish(interaction);
    }
}