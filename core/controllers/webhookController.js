import getConfig from 'next/config';
import { leadsService } from '../services';
import { leadsRepository, scriptsRepository } from '../repositories';
import {} from '../../infra/databases/mongodb/client';

const {
  serverRuntimeConfig: {
    graphFacebookConfig: { webhookAccessToken },
  },
} = getConfig();

export async function handleReplayLead(req, res) {
  if (!req.body?.object) {
    return res.status(404).json({ error: 'req.body?.object not present' });
  }

  if (!req.body?.entry[0]?.changes[0]?.value?.messages) {
    return res
      .status(200)
      .json({ error: 'does not have any message in payload, skipping' });
  }
  console.log('webhook with messages payload:', req.body);
  return res.status(200, { body: req.body });

  const recipientPhoneNumber = req.body.entry[0].changes[0].messages[0]?.from;
  if (!recipientPhoneNumber) {
    return res
      .status(200)
      .json({ error: 'phone number not found in request payload' });
  }

  const service = leadsService({ leadsRepository, scriptsRepository });

  try {
    await service.replyLead({
      recipientPhoneNumber,
    });
    return res.status(200, { success: true });
  } catch (error) {
    return res.status(200, { error });
  }
}

export function handleVerifyWebhook(req, res) {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode !== 'subscribe' || token !== webhookAccessToken) {
    return res.status(403).json({ err: 'invalid token' });
  }
  return res.status(200).send(challenge);
}
