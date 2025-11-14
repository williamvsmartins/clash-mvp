import { Command } from "#base";
import { ApplicationCommandType, ApplicationCommandOptionType } from "discord.js";
import { verificarPagamentosPendentes, processarWebhookPagamento } from "#functions";
import { PixPayment } from "#database";

new Command({
    name: "pagamentos",
    description: "Gerenciar pagamentos PIX",
    dmPermission: false,
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "verificar",
            description: "Verificar todos os pagamentos pendentes",
            type: ApplicationCommandOptionType.Subcommand,
        },
        {
            name: "processar",
            description: "Processar um pagamento específico manualmente",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "id",
                    description: "ID do pagamento no Mercado Pago",
                    type: ApplicationCommandOptionType.Integer,
                    required: true,
                },
            ],
        },
        {
            name: "listar",
            description: "Listar pagamentos recentes",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "status",
                    description: "Filtrar por status",
                    type: ApplicationCommandOptionType.String,
                    required: false,
                    choices: [
                        { name: "Pendente", value: "pending" },
                        { name: "Aprovado", value: "approved" },
                        { name: "Cancelado", value: "cancelled" },
                        { name: "Expirado", value: "expired" },
                    ],
                },
            ],
        },
    ],
    async run(interaction) {
        const subcommand = interaction.options.getSubcommand();

        await interaction.deferReply({ ephemeral: true });

        try {
            switch (subcommand) {
                case "verificar": {
                    await verificarPagamentosPendentes();
                    await interaction.editReply({
                        content: "✅ Verificação de pagamentos pendentes concluída! Verifique os logs para mais detalhes.",
                    });
                    break;
                }

                case "processar": {
                    const paymentId = interaction.options.getInteger("id", true);
                    await processarWebhookPagamento(paymentId);
                    await interaction.editReply({
                        content: `✅ Pagamento #${paymentId} processado com sucesso!`,
                    });
                    break;
                }

                case "listar": {
                    const status = interaction.options.getString("status");
                    const filter = status ? { status } : {};

                    const pagamentos = await PixPayment.find(filter)
                        .sort({ createdAt: -1 })
                        .limit(10);

                    if (pagamentos.length === 0) {
                        await interaction.editReply({
                            content: "Nenhum pagamento encontrado.",
                        });
                        return;
                    }

                    const lista = pagamentos.map(p => {
                        const valorReais = (p.valor / 100).toFixed(2);
                        const statusEmoji = {
                            pending: "⏳",
                            approved: "✅",
                            cancelled: "❌",
                            expired: "⌛",
                        }[p.status] || "❓";

                        return `${statusEmoji} **#${p.mercadoPagoId}** - R$ ${valorReais} - <@${p.userId}> - ${new Date(p.createdAt).toLocaleString('pt-BR')}`;
                    }).join("\n");

                    await interaction.editReply({
                        content: `**Últimos 10 pagamentos:**\n\n${lista}`,
                    });
                    break;
                }
            }
        } catch (error) {
            console.error("Erro ao gerenciar pagamentos:", error);
            await interaction.editReply({
                content: "❌ Erro ao processar o comando. Verifique os logs.",
            });
        }
    },
});
