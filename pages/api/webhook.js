module.exports = async function handler(req, res) {
  const { webhookController } = req.controllers;

  switch (req.method) {
    case 'POST':
      webhookController.handleReplayLead(req, res);
      break;

    default:
      webhookController.handleVerifyWebhook(req, res);
      break;
  }
};
