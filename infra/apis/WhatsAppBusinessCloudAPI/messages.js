import getConfig from 'next/config';
import httpClient from './configs/httpClient';

const {
  serverRuntimeConfig: { filesBaseURL },
} = getConfig();

export async function sendMessageByTemplate(template, recipientPhoneNumber) {
  try {
    const response = await httpClient.post('/messages', {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipientPhoneNumber,
      type: 'template',
      template: {
        name: template,
        language: {
          code: 'pt_BR',
        },
      },
    });

    return response;
  } catch (error) {
    throw new Error('failed on send message by template');
  }
}

export async function sendAudioMessage(recipientPhoneNumber, audio) {
  try {
    await httpClient.post('/messages', {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipientPhoneNumber,
      type: 'audio',
      audio: {
        link: `${filesBaseURL}/${audio}`,
      },
    });
  } catch (error) {
    throw new Error('failed on send audio message');
  }
}
