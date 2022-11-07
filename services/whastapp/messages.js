import httpClient from './httpClient'
import getConfig from 'next/config';

const {
    serverRuntimeConfig: {
        filesBaseURL
    }
} = getConfig()

export async function sendMessageByTemplate(template, recipientPhoneNumber) {
    const response = await httpClient.post('/messages', {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": recipientPhoneNumber,
        "type": "template",
        "template": {
            "name": template,
            "language": {
                "code": "pt_BR"
            },
        }
    })

    return response
}

export async function sendAudioMessage(recipientPhoneNumber, audio) {
    await httpClient.post('/messages', {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": recipientPhoneNumber,
        "type": "audio",
        "audio": {
            "link": `${filesBaseURL}/audio/${audio}.ogg`
        }
    })

}
