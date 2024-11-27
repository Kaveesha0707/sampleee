require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = 3001;  // Change to another port
const PORT = process.env.PORT || 3001;


// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI; // Ensure MONGO_URI is set in your .env file
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => console.log("Connected to MongoDB"));

// Define Schema and Model
const keywordSchema = new mongoose.Schema({
  text: { type: String, required: true },
  alertCount: { type: Number, default: 0 },
});

const Keyword = mongoose.model("Keyword", keywordSchema);

// Routes

// Get all keywords
app.get("/api/keywords", async (req, res) => {
  try {
    const keywords = await Keyword.find();
    res.json(keywords);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Add a new keyword
app.post("/api/keywords", async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).send("Keyword text is required.");
  }

  try {
    // Check if the keyword already exists
    const existingKeyword = await Keyword.findOne({ text });
    if (existingKeyword) {
      return res.status(400).send("Keyword already exists.");
    }

    const newKeyword = new Keyword({ text });
    await newKeyword.save();
    res.status(201).json(newKeyword);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Delete a keyword
app.delete("/api/keywords/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await Keyword.findByIdAndDelete(id);
    res.status(204).send();
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
