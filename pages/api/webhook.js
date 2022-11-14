const { webhookController } = require('../../infra/dependencyInjection');

module.exports = async function handler(req, res) {
  console.time('EXECUTION_DURATION');

  switch (req.method) {
    case 'POST':
      await webhookController.handleReplayLead(req, res);
      break;

    default:
      webhookController.handleVerifyWebhook(req, res);
      break;
  }

  console.timeEnd('EXECUTION_DURATION');
};
