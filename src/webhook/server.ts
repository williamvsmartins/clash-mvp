import { createServer, IncomingMessage, ServerResponse } from 'http';
import { processarWebhookPagamento } from '#functions';
import { env } from '#settings';

const PORT = env.WEBHOOK_PORT;


export function iniciarServidorWebhook() {
    const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
        const urlPath = req.url?.split('?')[0] || '';
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
            res.writeHead(200);
            res.end();
            return;
        }

        // Endpoint de health check
        if (urlPath === '/health' && req.method === 'GET') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                status: 'ok',
                message: 'Webhook server is running',
                timestamp: new Date().toISOString(),
                port: PORT
            }));
            return;
        }

        // Endpoint de teste do Mercado Pago (aceita GET e POST)
        if (urlPath === '/webhook/mercadopago' && req.method === 'GET') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                status: 'ok',
                message: 'Webhook endpoint is ready',
                endpoint: '/webhook/mercadopago',
                methods: ['POST'],
                timestamp: new Date().toISOString()
            }));
            return;
        }

        // Endpoint de webhook do Mercado Pago
        if (urlPath === '/webhook/mercadopago' && req.method === 'POST') {
            let body = '';

            req.on('data', (chunk) => {
                body += chunk.toString();
            });

            req.on('end', async () => {
                try {
                    console.log('📦 Body recebido:', body);
                    const data = JSON.parse(body);
                    console.log('📨 Webhook recebido do Mercado Pago:', JSON.stringify(data, null, 2));

                    if (data.action === 'payment.updated' || data.action === 'payment.created') {
                        const paymentId = parseInt(data.data.id);
                        console.log(`🔄 Processando pagamento ID: ${paymentId}`);

                        processarWebhookPagamento(paymentId).catch((error) => {
                            console.error('❌ Erro ao processar webhook:', error);
                        });

                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true, message: 'Webhook recebido' }));
                    } else {
                        console.log('⚠️ Evento ignorado:', data.action);
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true, message: 'Evento ignorado' }));
                    }
                } catch (error) {
                    console.error('❌ Erro ao processar webhook:', error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Erro ao processar webhook' }));
                }
            });

            return;
        }

        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Rota não encontrada' }));
    });

    server.listen(PORT, () => {
        console.log(`🌐 Servidor de webhooks rodando na porta ${PORT}`);
        console.log(`📍 Endpoint: http://localhost:${PORT}/webhook/mercadopago`);
    });

    return server;
}
