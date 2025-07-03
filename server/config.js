// FILE: server/config.js

require('dotenv').config();
module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'a_default_secret_key_for_development'
};