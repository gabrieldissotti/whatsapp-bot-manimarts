/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverRuntimeConfig: {
    graphFacebookConfig: {
      apiVersion: process.env.GRAPH_FACEBOOK_VERSION,
      senderPhoneNumber: process.env.GRAPH_FACEBOOK_PHONE,
      accessToken: process.env.GRAPH_FACEBOOK_ACCESS_TOKEN
    }

  }
}

module.exports = nextConfig
