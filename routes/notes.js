const express = require("express");
const Joi = require("joi");
const Note = require("../models/Note");
const protect = require("../middleware/protect");

const router = express.Router();

// validation schema
const noteSchema_validation = Joi.object({
  title: Joi.string().min(1).max(100),
  content: Joi.string().min(1).max(1000),
}).or("title", "content");

// CREATE a note
router.post("/", protect, async (request, response) => {
  const { error: validationError } = noteSchema_validation.validate(
    request.body,
  );
  if (validationError) {
    return response
      .status(400)
      .json({ message: validationError.details[0].message });
  }

  const newNote = new Note({
    title: request.body.title,
    content: request.body.content,
    userId: request.userId,
  });

  try {
    const savedNote = await newNote.save();
    response
      .status(201)
      .json({ message: "Note created successfully!", note: savedNote });
  } catch (error) {
    response
      .status(500)
      .json({ message: "Something went wrong", error: error });
  }
});

// read all notes
router.get("/", protect, async (request, response) => {
  try {
    const notes = await Note.find({ userId: request.userId });
    response.json(notes);
  } catch (error) {
    response
      .status(500)
      .json({ message: "Something went wrong", error: error });
  }
});

// read a single note
router.get("/:id", protect, async (request, response) => {
  const id = request.params.id;

  try {
    const note = await Note.findById(id);
    if (note) response.json(note);
    else response.status(404).json({ message: "Note not found" });
  } catch (error) {
    response
      .status(500)
      .json({ message: "Something went wrong", error: error });
  }
});

// delete note
router.delete("/:id", protect, async (request, response) => {
  const id = request.params.id;

  try {
    const deletedNote = await Note.findByIdAndDelete(id);
    if (deletedNote) response.json({ message: "Note deleted successfully!" });
    else response.status(404).json({ message: "Note not found" });
  } catch (error) {
    response
      .status(500)
      .json({ message: "Something went wrong", error: error });
  }
});

// update a note
router.patch("/:id", protect, async (request, response) => {
  const { error: validationError } = noteSchema_validation.validate(
    request.body,
  );
  if (validationError) {
    return response
      .status(400)
      .json({ message: validationError.details[0].message });
  }

  const id = request.params.id;
  const updates = request.body;

  try {
    const updatedNote = await Note.findByIdAndUpdate(id, updates, {
      new: true,
    });
    if (updatedNote) response.json(updatedNote);
    else response.status(404).json({ message: "Note not found" });
  } catch (error) {
    response
      .status(500)
      .json({ message: "Something went wrong", error: error });
  }
});

module.exports = router;
