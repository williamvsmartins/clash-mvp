import { Client, Interaction  } from 'discord.js';
import axios from 'axios';
import config from '../../config';
import { v4 } from 'uuid'
import qr from 'qr-image';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';

const { mercado_pago_token } = config;


export const setupPixGenerate = async (client: Client, interaction: Interaction, amount: number): Promise<string> => {
  const idempotencyKey = v4(); // Gera um UUID único para a requisição
  const expirationTime = new Date(Date.now() + 5 * 60 * 1000); // 5 minutos a partir do momento atual
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
          },
          date_of_expiration: expirationTime.toISOString()
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
    const filePath = join(__dirname, `temp-qr-code-${idempotencyKey}.png`);
    writeFileSync(filePath, qrImage);

    const userId = interaction.user.id;

    const user = await client.users.fetch(userId);
    if (user) {
      const dmChannel = await user.createDM();
      await dmChannel.send({
        content: `Olá <@${userId}>, faça o pagamento com o Pix usando o QR Code ou o copia e cola abaixo:`,
        files: [filePath]
      });
      await dmChannel.send({ content: qrCodeUrl });

      unlinkSync(filePath);

      // await interaction.reply({ content: 'O pix foi enviado em sua dm, por favor verifique', ephemeral: true });

      return paymentId;
    }
    return '';
  } catch (error) {
    console.error('Erro ao gerar o QR Code:', error);
    
    // await interaction.reply({ content: 'Erro ao gerar qrCode', ephemeral: true });
    return '';
  }
};
