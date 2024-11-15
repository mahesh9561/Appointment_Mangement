const bcrypt = require('bcrypt');

module.exports = {
    PORT: process.env.PORT || 8000,
    DB_URL: process.env.DB_URL,
    SESSION_SECRET: process.env.SESSION_SECRET || 'defaultsecret'
}