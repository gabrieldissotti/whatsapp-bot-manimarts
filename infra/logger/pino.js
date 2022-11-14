const pino = require('pino');

const logger = pino({
  level: 'debug',
  base: {
    env: process.env.NODE_ENV,
    revision: process.env.VERCEL_GITHUB_COMMIT_SHA,
  },
});

module.exports = logger;
