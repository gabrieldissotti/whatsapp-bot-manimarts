const { webhookController } = require('../../infra/dependencyInjection');

module.exports = async function handler(req, res) {
  switch (req.method) {
    case 'POST':
      webhookController.handleReplayLead(req, res);
      break;

    default:
      webhookController.handleVerifyWebhook(req, res);
      break;
  }
};
