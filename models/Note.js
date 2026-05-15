// connect to MongoDB
const mongoose = require("mongoose");

// notes Schema
const noteSchema = new mongoose.Schema({
  title: String,
  content: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// notes model
const Note = mongoose.model("Note", noteSchema);
module.exports = Note;
