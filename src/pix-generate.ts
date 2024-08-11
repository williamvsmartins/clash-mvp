import { Client, ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle, TextChannel } from 'discord.js';
import { User } from './database';
import axios from 'axios';
import config from '../config';
import { v4 } from 'uuid'
import qr from 'qr-image';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { paymentChack } from './confirm-pix';


const { mercado_pago_token } = config;


export const setupPixGenerate = async (client: Client, channel: TextChannel,
   userId : string):Promise<Boolean> => {
  const amount = 0.01; // Valor da transação em centavos (R$ 10,00)
  const idempotencyKey = v4(); // Gera um UUID único para a requisição
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

      const paymentId = paymentResponse.data.id;
      const qrCodeUrl = paymentResponse.data.point_of_interaction.transaction_data.qr_code;

      // Gere a imagem do QR Code
      const qrImage = qr.imageSync(qrCodeUrl, { type: 'png' });
      const filePath = join(__dirname, `temp-qr-code-${userId}.png`);
      writeFileSync(filePath, qrImage);

      // Envie a mensagem direta com o QR Code
    const user = await client.users.fetch(userId);
    if (user) {
      const dmChannel = await user.createDM();
      await dmChannel.send({
        content: `Olá <@${userId}>, faça o pagamento com o Pix usando o QR Code abaixo:`,
        files: [filePath]
      });
      await dmChannel.send({ content: qrCodeUrl });

      // Remova o arquivo temporário após o envio
      unlinkSync(filePath);
    }

      return paymentChack(paymentId, channel)

    } catch (error) {
      console.error('Erro ao gerar o QR Code:', error);
      await channel.send({ content: 'Houve um erro ao gerar o QR Code. Tente novamente mais tarde.' });
      return false;
    }
  
  };
