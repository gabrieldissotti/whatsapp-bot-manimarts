import axios from 'axios'
import getConfig from 'next/config'

const { 
  serverRuntimeConfig: {
    graphFacebookConfig: {
      apiVersion,
      accessToken,
      senderPhoneNumber,
    } 
  }
} = getConfig()

export default axios.create({
  baseURL: `https://graph.facebook.com/${apiVersion}/${senderPhoneNumber}`,
  headers: {
    Authorization: `Bearer ${accessToken}`
  }
})
