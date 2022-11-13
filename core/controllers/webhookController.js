import getConfig from 'next/config';
import LeadsService from '../services/LeadsService';
import { LeadsRepository, ScriptsRepository } from '../repositories';
import connection from '../../infra/databases/mongodb/client';

const {
  serverRuntimeConfig: {
    graphFacebookConfig: { webhookAccessToken },
  },
} = getConfig();

export async function handleReplayLead(req, res) {
  try {
    console.log('REQUEST PAYLOAD:', JSON.stringify(req.body));

    if (!req.body?.object) {
      return res.status(404).json({ error: 'req.body?.object not present' });
    }

    if (!req.body?.entry[0]?.changes[0]?.value?.messages) {
      return res
        .status(200)
        .json({ error: 'does not have any message in payload, skipping' });
    }

    const recipientPhoneNumber =
      req.body.entry[0].changes[0]?.value?.messages[0]?.from;

    if (!recipientPhoneNumber) {
      return res
        .status(200)
        .json({ error: 'phone number not found in request payload' });
    }

    const leadsRepository = new LeadsRepository({ connection });
    const scriptsRepository = new ScriptsRepository({ connection });
    const leadsService = new LeadsService({
      leadsRepository,
      scriptsRepository,
    });

    await leadsService.replyLead({
      recipientPhoneNumber,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(200).json({
      error: 'failed to reply lead request in controller',
      serviceError: error.message,
    });
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
