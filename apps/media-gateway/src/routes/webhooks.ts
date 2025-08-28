// apps/media-gateway/src/routes/webhooks.ts
import express, { Router, type Request, type Response } from 'express';
import { WebhookReceiver, type WebhookEvent } from 'livekit-server-sdk';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

const receiver = new WebhookReceiver(
    process.env.LIVEKIT_API_KEY || 'devkey',
    process.env.LIVEKIT_API_SECRET || 'secret',
);

// Use RAW body: a assinatura do LiveKit é calculada sobre o corpo bruto
router.post(
    '/',
    express.raw({ type: 'application/webhook+json' }),
    async (req: Request, res: Response) => {
        try {
            // v2.x: receba passando o corpo bruto (Buffer) e AGUARDE a Promise
            const event: WebhookEvent = await receiver.receive(req.body);

            console.log(
                'LiveKit Webhook Event:',
                event.event,
                event.room?.name,
                event.participant?.identity,
            );

            // Trate os eventos conforme sua regra de negócio
            switch (event.event) {
                case 'room_started':
                    // Handle room started event
                    break;
                case 'room_finished':
                    // Handle room finished event
                    break;
                case 'participant_joined':
                    // Handle participant joined event
                    break;
                case 'participant_left':
                    // Handle participant left event
                    break;
                case 'egress_started':
                    // Handle egress started event
                    break;
                case 'egress_ended':
                    // Handle egress ended event
                    break;
                default:
                    console.log('Unhandled LiveKit event:', event.event);
            }

            // 200/204 indica recebimento OK
            res.sendStatus(200);
        } catch (error) {
            // Assinatura inválida ou payload inválido → 400
            console.error('Error processing webhook:', error);
            res.sendStatus(400);
        }
    },
);

export default router;
