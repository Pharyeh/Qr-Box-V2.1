// server/logger.js

const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

const logStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

module.exports = morgan('combined', { stream: logStream });
