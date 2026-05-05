import { createServer, IncomingMessage, ServerResponse } from 'http';
import { processPaymentWebhook } from '#functions';
import { env } from '#settings';

const PORT = env.WEBHOOK_PORT;
const MAX_BODY_BYTES = 1024 * 16; // 16 KB — enough for any MP webhook payload

export function startWebhookServer() {
    const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
        const urlPath = req.url?.split('?')[0] ?? '';

        if (req.method === 'OPTIONS') {
            res.writeHead(204);
            res.end();
            return;
        }

        if (urlPath === '/health' && req.method === 'GET') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString(), port: PORT }));
            return;
        }

        if (urlPath === '/webhook/mercadopago' && req.method === 'GET') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'ok', endpoint: '/webhook/mercadopago' }));
            return;
        }

        if (urlPath === '/webhook/mercadopago' && req.method === 'POST') {
            let body = '';
            let bodySize = 0;

            req.on('data', (chunk) => {
                bodySize += chunk.length;
                if (bodySize > MAX_BODY_BYTES) {
                    req.destroy();
                    return;
                }
                body += chunk.toString();
            });

            req.on('end', async () => {
                let data: Record<string, unknown>;
                try {
                    data = JSON.parse(body);
                } catch {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Invalid JSON body' }));
                    return;
                }

                const action = typeof data.action === 'string' ? data.action : '';
                const paymentIdRaw = (data.data as Record<string, unknown> | undefined)?.id;

                if (action === 'payment.updated' || action === 'payment.created') {
                    const paymentId = parseInt(String(paymentIdRaw), 10);
                    if (isNaN(paymentId) || paymentId <= 0) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Invalid payment ID' }));
                        return;
                    }

                    processPaymentWebhook(paymentId).catch(() => {});

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true }));
                } else {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, message: 'Event ignored' }));
                }
            });

            return;
        }

        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found' }));
    });

    server.listen(PORT, () => {
        console.log(`Webhook server listening on port ${PORT}`);
    });

    return server;
}
