const getConfig = require('next/config');

class AuthService {
  constructor() {
    this.isTokenValid = false;
  }

  async verifyToken({ mode, token }) {
    const {
      serverRuntimeConfig: {
        graphFacebookConfig: { webhookAccessToken },
      },
    } = getConfig();

    if (mode !== 'subscribe' || token !== webhookAccessToken) {
      throw new Error('invalid token');
    }

    this.isTokenValid = true;
  }

  async verifyCallMyAppToken(token) {
    const {
      serverRuntimeConfig: { callMyAppToken },
    } = getConfig();

    if (token !== callMyAppToken) {
      throw new Error('invalid token');
    }

    this.isTokenValid = true;
  }
}

module.exports = AuthService;
