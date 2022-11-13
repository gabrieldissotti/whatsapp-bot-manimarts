import {
  handleReplayLead,
  handleVerifyWebhook,
} from '../../core/controllers/webhookController';

export default async function handler(req, res) {
  switch (req.method) {
    case 'POST':
      handleReplayLead(req, res);
      break;

    default:
      handleVerifyWebhook(req, res);
      break;
  }
}
