import { Router } from 'express';
import { WebhookReceiver } from 'livekit-server-sdk';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

const receiver = new WebhookReceiver(
  process.env.LIVEKIT_API_KEY || 'devkey',
  process.env.LIVEKIT_API_SECRET || 'secret'
);

router.post('/', async (req, res) => {
  try {
    const event = receiver.receive(req.body, req.headers.authorization);
    console.log('LiveKit Webhook Event:', event.event, event.room?.name, event.participant?.identity);

    // Process the event (e.g., update database, trigger actions)
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

    res.status(200).send('OK');
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).send('Error');
  }
});

export default router;

