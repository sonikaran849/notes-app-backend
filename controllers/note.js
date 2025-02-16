const Note = require("../models/note");
const bucket = require('../config/firebase');


const createANote = async (req,res)=>{
    const {title , description, type, userId} = req.body;
    try {
        if(!title || !description || !type || !userId){
            res.status(400).json("Insufficient Data");
        }

        const note = new  Note({
            title,
            description,
            type,
            userId
        });
        await note.save();
        console.log(note);
        res.status(200).json({ note }); 
    } catch (error) {
        res.status(500).send("Error creating Note");
    }
}

const deleteNote = async (req, res) => {
    const id = req.params.id;
  
    try {
      // Find the note to get its audio and image URLs
      const note = await Note.findById(id);
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }
  
      // Delete Images from Firebase Storage
      if (note.images && note.images.length > 0) {
        const deleteImagePromises = note.images.map((imageUrl) => {
          const fileName = imageUrl.split("/").pop(); // Extract file name from URL
          return bucket.file(fileName).delete(); // Delete the file
        });
  
        await Promise.all(deleteImagePromises); // Wait for all images to be deleted
      }
      // Delete Audio from Firebase Storage
      if (note.Audio) {
        const audioFileName = note.Audio.split("/").pop(); // Extract audio file name
        await bucket.file(audioFileName).delete(); // Delete the audio file
      }
  
      // Delete Note from MongoDB
      const result = await Note.findByIdAndDelete(id);
      res.status(200).json({ message: "Note deleted successfully", deletedNote: result });
  
    } catch (error) {
      console.error("Error deleting the note:", error);
      res.status(500).json({ error: "Error deleting the note" });
    }
  };

  const updateNote = async (req, res) => {
    const { id } = req.params;
    const { description } = req.body;
  
    try {
      const updatedNote = await Note.findByIdAndUpdate(
        id,
        { description },
        { new: true }
      );
  
      if (!updatedNote) {
        return res.status(404).json({ message: "Note not found" });
      }
  
      res.status(200).json({ message: "Note updated successfully", updatedNote });
    } catch (error) {
      console.error("Error updating note:", error);
      res.status(500).json({ message: "Internal server error" });
    }  
  };
// Rename Note
const renameNote= async (req, res) => {

  const { id } = req.params;
  const { title } = req.body;

  try {
    const updatedNote = await Note.findByIdAndUpdate(
      id,
      { title },
      { new: true }
    );
    console.log(title)   
   
    if (!updatedNote) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.status(200).json({ message: "Note updated successfully", updatedNote });
  } catch (error) {
    console.error("Error updating note:", error);
    res.status(500).json({ message: "Internal server error" });
  }  
};



  

module.exports = {
    createANote,
    deleteNote,
    updateNote,
    renameNote
} 
