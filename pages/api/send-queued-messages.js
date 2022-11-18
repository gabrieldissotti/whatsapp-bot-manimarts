const { leadsController } = require('../../infra/dependencyInjection');

module.exports = async function handler(req, res) {
  await leadsController.handleSendQueuedMessages(req, res);
};
