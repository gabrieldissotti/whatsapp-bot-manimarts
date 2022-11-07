import { sendAudioMessage } from '../../services/whastapp'
import audios from '../../constants/audios'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    if (!req.body?.object) {
      return res.status(404), json({ error: 'req.body?.object not present' });
    }

    if (req.body?.entry[0]?.changes[0]?.value?.messages[0]) {
      const recipientPhoneNumber = req.body.entry[0].changes[0].value.metadata.phone_number_id;
      const from = req.body.entry[0].changes[0].value.messages[0].from;
      const message = req.body.entry[0].changes[0].value.messages[0].text.body;

      console.log({
        recipientPhoneNumber,
        from,
        message
      })

      const randomAudio = audios[Math.floor(Math.random() * audios.length)];

      await sendAudioMessage(recipientPhoneNumber, randomAudio)

      return res.status(200).json({ success: true, recipientPhoneNumber, audio: randomAudio });
    }

    return res.status(200).json({ success: true });
  } else {
    const verify_token = "token123gabes";

    // Parse params from the webhook verification request
    let mode = req.query["hub.mode"];
    let token = req.query["hub.verify_token"];
    let challenge = req.query["hub.challenge"];

    // Check if a token and mode were sent
    if (mode && token) {
      // Check the mode and token sent are correct
      if (mode === "subscribe" && token === verify_token) {
        // Respond with 200 OK and challenge token from the request
        console.log("WEBHOOK_VERIFIED");
        return res.status(200).send(challenge);
      } else {
        // Responds with '403 Forbidden' if verify tokens do not match
        return res.status(403).json({ err: 'verify tokens do not match' });
      }
    }

    return res.status(403).json({ err: 'modem and token not defined' });
  }
}


// info on WhatsApp text message payload: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples#text-messages
