const getConfig = require('next/config');
const axios = require('axios');

module.exports = class WhatsAppBusinessCloudAPI {
  constructor() {
    this.filesBaseURL = null;
    this.defaultFields = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
    };
    this.httpClient = null;
  }

  getFilesBaseURL() {
    if (!this.filesBaseURL) {
      const {
        serverRuntimeConfig: { filesBaseURL },
      } = getConfig();
      this.filesBaseURL = filesBaseURL;
    }

    return this.filesBaseURL;
  }

  getHttpClient() {
    if (this.httpClient) return this.httpClient;

    const {
      serverRuntimeConfig: {
        graphFacebookConfig: { apiVersion, accessToken, senderPhoneNumber },
      },
    } = getConfig();

    this.httpClient = axios.create({
      baseURL: `https://graph.facebook.com/${apiVersion}/${senderPhoneNumber}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return this.httpClient;
  }

  async sendMessageByTemplate(template, recipientPhoneNumber) {
    try {
      const httpClient = this.getHttpClient();

      const response = await httpClient.post('/messages', {
        ...this.defaultFields,
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

  async sendAudioMessage(recipientPhoneNumber, audio) {
    try {
      const httpClient = this.getHttpClient();

      await httpClient.post('/messages', {
        ...this.defaultFields,
        to: recipientPhoneNumber,
        type: 'audio',
        audio: {
          link: `${this.getFilesBaseURL()}/${audio}`,
        },
      });
    } catch (error) {
      throw new Error('failed on send audio message');
    }
  }
};
