const mongoose = require('mongoose');

module.exports.getConnection = () => mongoose.connect(process.env.MONGODB_DSN);
