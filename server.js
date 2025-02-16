const { configDotenv } = require("dotenv");
const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const PORT = 7777
require('dotenv').config();
connectDB().then(()=>{console.log("DataBase Connected")});


app.use(cors());
app.use(bodyParser.json());


const uploadRoute = require("./routes/upload");
app.use("/api/notes/", uploadRoute);

const noteRoute = require("./routes/note");
app.use("/api/NoteData", noteRoute);

const authRoute = require("./routes/auth");
app.use("/api/auth", authRoute);


app.listen(PORT, ()=>{
    console.log("Server Started");
});
