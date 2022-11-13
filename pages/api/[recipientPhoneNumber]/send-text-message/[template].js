import { sendMessageByTemplate } from '../../../../infra/apis/WhatsAppBusinessCloudAPI';

export default async function handler(req, res) {
  const { recipientPhoneNumber, template } = req.query;

  await sendMessageByTemplate(template, recipientPhoneNumber);

  return res.status(200).json({ sent: true, recipientPhoneNumber });
}
