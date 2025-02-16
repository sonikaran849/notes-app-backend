// routes/uploadRoutes.
const express = require('express');
const multer = require('multer');
const path = require('path');
const Note = require('../models/note');
const bucket = require('../config/firebase');
const {authMiddleware}  = require('../middleware/auth');
const router = express.Router();

// Setup multer to store files in memory (we won't save files locally)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


const admin = require("firebase-admin");
// bucket = admin.storage().bucket();


// Route to upload audio file
router.post('/audio', authMiddleware ,upload.single('audio'), async (req, res) => {
  try {
    const { title, description, favourite,type ,userId} = req.body;
    console.log(req.file)
    // Upload the audio file to Firebase Storage
    const file =  bucket.file(Date.now() + ".webm");
    const stream = file.createWriteStream({
      metadata: { contentType: req.file.mimetype },
    });

    stream.on('finish', async () => {
      await file.makePublic();
      // Get the public URL of the uploaded audio file
      const publicAudioUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
      console.log(publicAudioUrl)
      // Save the note (metadata and audio URL) in MongoDB
      const newNote = new Note({
        title,
        description,
        favourite: favourite || false,
        Audio: publicAudioUrl, // Store the URL of the uploaded audio
        type: type, 
        userId, // Authenticated user ID
      });
      console.log(newNote)
      await newNote.save();
      res.status(200).json({ newNote }); 
    });

    stream.end(req.file.buffer); // Upload the file to Firebase
  } catch (error) {
    console.error(error);
    res.status(500).send('Error uploading audio');
  }
});

// Route to upload image file
router.patch('/uploadImage', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.body; // Get the note ID from formData

    if (!id) {
      return res.status(400).json({ error: 'Note ID is required' });
    }

    // Find the note
    const note = await Note.findById(id);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Upload the image file to Firebase Storage
    const file = bucket.file(Date.now() + path.extname(req.file.originalname));
    const stream = file.createWriteStream({
      metadata: { contentType: req.file.mimetype },
    });

    stream.on('finish', async () => {
      await file.makePublic();
      // Get the public URL of the uploaded image
      const publicImageUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;

      // Update the note by adding the new image to the existing images array
      note.images.push(publicImageUrl);
      await note.save();

      res.status(200).json({ message: 'Image uploaded successfully', url: publicImageUrl });
    });

    stream.end(req.file.buffer); // Upload the file to Firebase
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error uploading image' });
  }
});


// Route to fetch all notes (sorted by date, and searchable)
router.get('/:id', authMiddleware,async (req, res) => {
  try {
    const { search, sort = 'desc' } = req.query; // Search and sort query params

    let query = { userId: req.params.id };
    console.log(query);
    // If search query is provided, search by title and description
    if (search) {
      query = {
        ...query,
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ],
      };
    }

    // Fetch notes with sorting (old to new or new to old)
    const notes = await Note.find(query)
      .sort({ createdAt: sort === 'asc' ? 1 : -1 })
      .exec();

    res.status(200).json(notes);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching notes');
  }
});

// Route to fetch favorite notes
router.get('/favourites/:id' ,async (req, res) => {
  try {

    const notes = await Note.find({ favourite: true, userId: req.params.id }).exec();
    res.status(200).json(notes);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching favorite notes');
  }
});

// Add Favourites 
router.patch("/:id/favourite", async (req,res)=>{
  try {
    const { id } = req.params;
    const note = await Note.findById(id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Toggle favourite status
    note.favourite = !note.favourite;

    await note.save();

    return res.status(200).json({ message: 'Favourite status toggled', note });
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error', error: err.message });
  }

})


router.delete("/:id/deleteImage", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params; // Note ID
    const { imageUrl } = req.body; // Image URL to delete

    if (!id || !imageUrl) {
      return res.status(400).json({ error: "Note ID and Image URL are required" });
    }

    const note = await Note.findById(id);
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    // Remove the image from the note's images array
    note.images = note.images.filter(img => img !== imageUrl);
    await note.save();

    // Extract the filename from the URL
    const fileName = imageUrl.split("/").pop();
    const file = admin.storage().bucket().file(fileName);

    // Delete the file from Firebase Storage
    await file.delete();

    res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({ error: "Error deleting image" });
  }
});

module.exports = router;