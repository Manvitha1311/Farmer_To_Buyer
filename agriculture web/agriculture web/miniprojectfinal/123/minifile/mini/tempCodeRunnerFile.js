// backend.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Temporary in-memory database
let farmers = [];

// POST: Add farmer crop
app.post("/api/farmers", (req, res) => {
  const { crop, name, location, contact, price } = req.body;

  if (!crop || !name || !location || !contact || !price) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const newCrop = {
    id: farmers.length + 1,
    crop,
    name,
    location,
    contact,
    price
  };

  farmers.push(newCrop);
  console.log("Crop added:", newCrop);
  res.status(201).json({ message: "Crop added successfully", crop: newCrop });
});

// GET: Get all crops
app.get("/api/farmers", (req, res) => {
  res.json(farmers);
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
