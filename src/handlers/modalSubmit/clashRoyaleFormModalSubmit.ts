import { Client, Interaction } from "discord.js";
import { User } from "../../db/database";
import axios from 'axios';
import config from '../../../config';

const { clashRoyaleApiToken, registeredRoleId, notRegisterRoleId } = config;


export const setupClashRoyaleFormModalSubmit = async (client: Client, interaction: Interaction) => {
  if (!interaction.isModalSubmit() || interaction.customId !== 'clash_tag_modal') return;

  var clashTag = interaction.fields.getTextInputValue('clashTag');
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
      { clashTag, moedas: 0.0 },
      { upsert: true },
    );


    const role = guild?.roles.cache.find(r => r.id === registeredRoleId);
    const roleNotRegiter = guild?.roles.cache.find(r => r.id === notRegisterRoleId)

    if (role && guild != null && roleNotRegiter) {
      const member = guild.members.cache.get(userId);
      if (member) {
        if (!member.roles.cache.has(registeredRoleId) && member.roles.cache.has(notRegisterRoleId)) {
          await member.roles.add(role);
          await member.roles.remove(roleNotRegiter);
        }
      }
    }
    await interaction.reply({ content: `Tag do Clash Royale ${clashTag} validada e salva com sucesso!`, ephemeral: true });

  } catch (error) {
    await interaction.reply({ content: `Falha ao validar a tag do Clash Royale: ${error}`, ephemeral: true });
    console.log(error)
  }
}