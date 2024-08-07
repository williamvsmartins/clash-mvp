import { Client, ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } from 'discord.js';
import { User } from './database';
import axios from 'axios';
import config from '../config';
import { v4 } from 'uuid'
import qr from 'qr-image';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';


const { mercado_pago_token } = config;
const idempotencyKey = v4(); // Gera um UUID único para a requisição


export const setupPixGenerate = (client: Client): void => {
  client.on('interactionCreate', async interaction => {
    if (!interaction.isButton() || interaction.customId !== 'pix') return;
    const userId = interaction.user.id; // ID do usuário do Discord que clicou no botão
    const amount = 0.01; // Valor da transação em centavos (R$ 10,00)
  try {
    const paymentResponse = await axios.post(
        'https://api.mercadopago.com/v1/payments',
        {
          transaction_amount: amount,
          description: 'Pagamento via Pix',
          payment_method_id: 'pix',
          payer: {
            email: 'williamvaltherprogramador@gmail.com', // Email do pagador (pode ser um valor padrão)
            identification: {
              type: 'CPF',
              number: '07465613345' // CPF do pagador (pode ser um valor padrão)
            }
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${mercado_pago_token}`,  
            'Content-Type': 'application/json',
            'X-Idempotency-Key': idempotencyKey
          }
        }
      );
      const qrCodeUrl = paymentResponse.data.point_of_interaction.transaction_data.qr_code;
      console.log(paymentResponse.data)

      // Gere a imagem do QR Code
      const qrImage = qr.imageSync(qrCodeUrl, { type: 'png' });
      const filePath = join(__dirname, 'temp-qr-code.png');
      writeFileSync(filePath, qrImage);

      // Envie a imagem como um anexo no Discord
      await interaction.reply({ files: [filePath], ephemeral: true });

      // Remova o arquivo temporário após o envio
      unlinkSync(filePath);
    } catch (error) {
      console.error('Erro ao gerar o QR Code:', error);
      await interaction.reply({ content: 'Houve um erro ao gerar o QR Code. Tente novamente mais tarde.', ephemeral: true });
    }
  
  });
};
