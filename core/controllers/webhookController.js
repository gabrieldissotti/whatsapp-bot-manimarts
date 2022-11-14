/* eslint-disable class-methods-use-this */

class WebhookController {
  constructor({ leadsService, authService, logger }) {
    this.leadsService = leadsService;
    this.authService = authService;
    this.logger = logger;
  }

  async handleWebhook(req, res) {
    try {
      this.logger.child({ body: req.body }).info('request payload');

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

      const messageGiven =
        req.body.entry[0].changes[0].value.messages[0]?.text?.body;

      await this.leadsService.replyLead({
        recipientPhoneNumber,
        messageGiven,
      });

      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(200).json({
        error: 'failed to reply lead request in controller',
        serviceError: error.message,
      });
    }
  }

  handleVerifyWebhook(req, res) {
    this.logger.child({ query: req.query }).info('request payload');

    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    try {
      this.authService.verifyToken({
        mode,
        token,
      });

      return res.status(200).send(challenge);
    } catch (error) {
      return res.status(404).send();
    }
  }
}

module.exports = WebhookController;
