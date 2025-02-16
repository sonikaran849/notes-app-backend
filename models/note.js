const mongoose = require("mongoose")

const noteSchema = new mongoose.Schema({
    favourite:{
        type: Boolean,
        default: false,
    },
    Audio:{
        type: String,
    },
    title:{
        type: String,
        required: true, 
    },
    description:{
        type: String,
        required: true,
    },
    images:[
        { type: String}
    ],
    type:{
        type:String,
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }, 
},{timestamps: true});

const Note = mongoose.model("notes",noteSchema);
module.exports = Note;
