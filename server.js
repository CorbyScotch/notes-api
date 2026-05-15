const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const notesRoutes = require("./routes/notes");

const app = express();
app.use(express.json());
app.use(express.static(__dirname));
app.use(cors());

// logger middleware
app.use((request, response, next) => {
  console.log("New request: " + request.method + " " + request.url);
  next();
});

// connect to MongoDB
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => {
    console.log("Full error:", JSON.stringify(error, null, 2));
    console.log("Message:", error.message);
  });

app.use("/auth", authRoutes);
app.use("/notes", notesRoutes);

app.listen(3000, () => console.log("Server is running on port 3000"));
