require("dotenv").config();
const mongoose = require("mongoose");

// MongoDB connection
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

// Serverless function for handling keywords
module.exports = async (req, res) => {
  if (req.method === "GET") {
    // GET /keywords
    try {
      const keywords = await Keyword.find();
      res.status(200).json(keywords);
    } catch (err) {
      res.status(500).send(err.message);
    }
  } else if (req.method === "POST") {

    const { text } = req.body;

    if (!text) {
      return res.status(400).send("Keyword text is required.");
    }

    try {
 
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
  } else if (req.method === "DELETE") {

    const { id } = req.query;

    try {
      await Keyword.findByIdAndDelete(id);
      res.status(204).send();
    } catch (err) {
      res.status(500).send(err.message);
    }
  } else {

    res.status(405).send("Method Not Allowed");
  }
};
