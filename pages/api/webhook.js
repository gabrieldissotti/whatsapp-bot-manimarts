const { webhookController } = require('../../infra/dependencyInjection');

module.exports = async function handler(req, res) {
  switch (req.method) {
    case 'POST':
      await webhookController.handleWebhook(req, res);
      break;

    default:
      webhookController.handleVerifyWebhook(req, res);
      break;
  }
};
