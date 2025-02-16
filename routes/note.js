const express = require("express");
const noteController = require("../controllers/note");
const {authMiddleware } = require("../middleware/auth");
const router = express.Router();

// Get All the Notes
// router.get("/", getAllNotes);

//Create a Note
router.post("/", authMiddleware , noteController.createANote)

// Delte a Note 
router.delete("/delete/:id", authMiddleware, noteController.deleteNote)

// Update a Note
router.patch("/update/:id", noteController.updateNote);

router.patch("/rename/:id", noteController.renameNote);


module.exports = router;