/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverRuntimeConfig: {
    graphFacebookConfig: {
      apiVersion: process.env.GRAPH_FACEBOOK_VERSION,
      senderPhoneNumber: process.env.GRAPH_FACEBOOK_PHONE,
      accessToken: process.env.GRAPH_FACEBOOK_ACCESS_TOKEN,
      webhookAccessToken: process.env.GRAPH_FACEBOOK_WEBHOOK_ACCESS_TOKEN,
    },
    filesBaseURL: process.env.FILES_BASE_URL,
    database: {
      mongodbDSN: process.env.MONGODB_URI,
    },
  },
};

console.log(nextConfig);

module.exports = nextConfig;
