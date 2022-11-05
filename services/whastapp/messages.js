import httpClient from './httpClient'

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
