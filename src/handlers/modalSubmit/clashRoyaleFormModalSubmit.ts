import { Client, Interaction } from "discord.js";
import { User } from "../../db/database";
import axios from 'axios';
import config from '../../../config';

const { clashRoyaleApiToken, registeredRoleId } = config;


export const setupClashRoyaleFormModalSubmit = async (client: Client, interaction: Interaction) => {
    if (!interaction.isModalSubmit() || interaction.customId !== 'clash_tag_modal') return;

    var clashTag = interaction.fields.getTextInputValue('clashTag');
    const pix = interaction.fields.getTextInputValue('pix');
    const userId = interaction.user.id;
    const guild = interaction.guild;

    if (clashTag.startsWith('#')) {
      clashTag = clashTag.slice(1);
    }

    clashTag.toUpperCase();

    try {
      const response = await axios.get(`https://proxy.royaleapi.dev/v1/players/%23${clashTag}`, {
        headers: { 'Authorization': `Bearer ${clashRoyaleApiToken}` },
      });

      await User.updateOne(
        { userId },
        { clashTag, pix, moedas: 0.0 },
        { upsert: true },
      );

      await interaction.reply({content: `Tag do Clash Royale ${clashTag} e Pix foi validada e salva com sucesso!`, ephemeral: true });
      const role = guild?.roles.cache.find(r => r.id === registeredRoleId);

      if (role && guild!=null) {
        const member = guild.members.cache.get(userId);
        if (member) {
          await member.roles.add(role);
        }
      }
      
    } catch (error) {
      await interaction.reply({ content: `Falha ao validar a tag do Clash Royale: ${error}`, ephemeral: true });
    }
}