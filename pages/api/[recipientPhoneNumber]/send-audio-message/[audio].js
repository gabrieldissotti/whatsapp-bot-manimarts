import { sendAudioMessage } from '../../../../infra/apis/WhatsAppBusinessCloudAPI';

export default async function handler(req, res) {
  const { recipientPhoneNumber, audio } = req.query;

  const response = await sendAudioMessage(recipientPhoneNumber, audio);

  return res.status(200).json(response);
}
