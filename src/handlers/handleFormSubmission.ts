import { Client, Interaction } from "discord.js";
import { setupClashRoyaleFormModalSubmit } from "./modalSubmit/clashRoyaleFormModalSubmit";
import { buttonsWalletModal } from "./modalSubmit/buttons-wallet-modalSubmit";


export const handleFormSubmission = async (client: Client, interaction: Interaction) => {
    if (!interaction.isModalSubmit()) return;

    const id = interaction.customId;

    if(id === 'clash_tag_modal'){
        setupClashRoyaleFormModalSubmit(client, interaction);
    }else if(id === 'deposito_modal' || id === 'saque_modal'){
        buttonsWalletModal(client, interaction);
    }
}