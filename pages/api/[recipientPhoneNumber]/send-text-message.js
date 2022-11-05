import { sendMessageByTemplate } from '../../../services/whastapp'

export default async function handler(req, res) {
  const { recipientPhoneNumber } = req.query

  const response = await sendMessageByTemplate('boas_vindas', recipientPhoneNumber)

  return res.status(200).json(response)
}