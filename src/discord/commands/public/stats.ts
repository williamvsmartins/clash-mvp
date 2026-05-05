import { Command } from '#base';
import { ApplicationCommandType, EmbedBuilder } from 'discord.js';
import { User, Transaction } from '#database';
import { clashRoyaleService } from '#functions';

new Command({
    name: 'stats',
    description: 'Veja seu perfil detalhado no Clash Royale e sua posição na plataforma',
    type: ApplicationCommandType.ChatInput,
    dmPermission: false,

    async run(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const userId = interaction.user.id;

        const user = await User.findOne({ userId });

        if (!user?.clashTag) {
            await interaction.followUp({
                content: '❌ Você ainda não vinculou sua tag do Clash Royale. Use o botão de registro para começar.',
            });
            return;
        }

        const [player, allUsers, transactions] = await Promise.all([
            clashRoyaleService.getPlayer(user.clashTag),
            User.find({ clashTag: { $exists: true, $ne: '' } }),
            Transaction.find({ userId }),
        ]);

        if (!player) {
            await interaction.followUp({
                content: '❌ Não foi possível buscar seus dados no Clash Royale. Tente novamente mais tarde.',
            });
            return;
        }

        const wins = transactions.filter(t => t.type === 'prize').length;
        const losses = transactions.filter(t => t.type === 'match_debit').length;
        const totalMatches = wins + losses;
        const winRate = totalMatches > 0 ? ((wins / totalMatches) * 100).toFixed(1) : '0.0';

        const totalEarned = transactions
            .filter(t => t.type === 'prize')
            .reduce((sum, t) => sum + t.amount, 0);
        const totalSpent = transactions
            .filter(t => t.type === 'match_debit')
            .reduce((sum, t) => sum + t.amount, 0);
        const netProfit = totalEarned - totalSpent;

        const allUsersWithStats = await Promise.all(
            allUsers.map(async (u) => {
                const txs = await Transaction.find({ userId: u.userId });
                return {
                    userId: u.userId,
                    wins: txs.filter(t => t.type === 'prize').length,
                    balance: u.balance,
                };
            })
        );

        allUsersWithStats.sort((a, b) => b.wins - a.wins);
        const rankPosition = allUsersWithStats.findIndex(u => u.userId === userId) + 1;

        const clashWinRate = player.battleCount > 0
            ? ((player.wins / player.battleCount) * 100).toFixed(1)
            : '0.0';

        const embed = new EmbedBuilder()
            .setColor(0xF4A200)
            .setTitle(`📊 ${player.name} — ${player.tag}`)
            .setDescription(
                `**${player.arena?.name ?? 'Arena desconhecida'}** ${player.clan ? `• Clã: **${player.clan.name}**` : '• Sem clã'}`
            )
            .addFields(
                { name: '🏆 Troféus', value: `${player.trophies.toLocaleString('pt-BR')}`, inline: true },
                { name: '🥇 Melhor', value: `${player.bestTrophies.toLocaleString('pt-BR')}`, inline: true },
                { name: '​', value: '​', inline: true },

                { name: '⚔️ Vitórias (Clash)', value: `${player.wins.toLocaleString('pt-BR')}`, inline: true },
                { name: '💀 Derrotas (Clash)', value: `${player.losses.toLocaleString('pt-BR')}`, inline: true },
                { name: '📈 WinRate (Clash)', value: `${clashWinRate}%`, inline: true },

                { name: '🎮 Duelos na plataforma', value: `${totalMatches}`, inline: true },
                { name: '✅ Vitórias', value: `${wins}`, inline: true },
                { name: '📊 WinRate', value: `${winRate}%`, inline: true },

                { name: '💰 Ganhos', value: `R$ ${(totalEarned / 100).toFixed(2)}`, inline: true },
                { name: '💸 Perdas', value: `R$ ${(totalSpent / 100).toFixed(2)}`, inline: true },
                { name: `${netProfit >= 0 ? '📈' : '📉'} Saldo líquido`, value: `R$ ${(netProfit / 100).toFixed(2)}`, inline: true },

                { name: '🏅 Ranking na plataforma', value: `#${rankPosition} de ${allUsersWithStats.length} jogadores`, inline: false },
            )
            .setFooter({ text: 'Dados do Clash Royale atualizados em tempo real' })
            .setTimestamp();

        if (player.currentFavouriteCard) {
            embed.setThumbnail(player.currentFavouriteCard.iconUrls.medium);
        }

        await interaction.followUp({ embeds: [embed] });
    }
});
