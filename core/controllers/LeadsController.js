/* eslint-disable class-methods-use-this */

const { v4: uuid } = require('uuid');

class LeadsController {
  constructor({ leadsService, authService, logger }) {
    this.leadsService = leadsService;
    this.authService = authService;
    this.logger = logger;
  }

  async handleSendQueuedMessages(req, res) {
    try {
      const token = req.body?.token;

      this.authService.verifyCallMyAppToken(token);

      await this.leadsService.sendQueuedMessages({
        requestID: uuid(),
      });

      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({
        error: 'failed to unlock leads and trigger next stage in controller',
        serviceError: error.message,
      });
    }
  }
}

module.exports = LeadsController;
