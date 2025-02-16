const mongoose = require("mongoose");

async function connectDB(){
    mongoose.connect(process.env.mongoUrl);
}

module.exports = connectDB;