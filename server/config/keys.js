// server/config/keys.js

module.exports = {
  jwtSecret: process.env.JWT_SECRET,
  google: {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectURI: process.env.GOOGLE_REDIRECT_URI
  }
  // Add other service keys as needed (OANDA, OpenAI, etc.)
};
