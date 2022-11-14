const {
  sendMessageByTemplate,
} = require('../../../../infra/apis/WhatsAppBusinessCloudAPI/messages');

module.exports = async function handler(req, res) {
  const { recipientPhoneNumber, template } = req.query;

  await sendMessageByTemplate(template, recipientPhoneNumber);

  return res.status(200).json({ sent: true, recipientPhoneNumber });
};
