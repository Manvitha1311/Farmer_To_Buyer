const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ connect to MongoDB (change username & password)
mongoose.connect("mongodb+srv://<username>:<password>@cluster0.mongodb.net/farmerDB")
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.log("❌ MongoDB error:", err));

const farmerSchema = new mongoose.Schema({
  crop: String,
  name: String,
  location: String,
  contact: String,
  price: Number
});

const Farmer = mongoose.model("Farmer", farmerSchema);

// 👉 when farmer submits
app.post("/api/farmers", async (req, res) => {
  try {
    const farmer = new Farmer(req.body);
    await farmer.save();
    res.status(201).json({ message: "Farmer added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error saving farmer" });
  }
});

// 👉 when buyer clicks a crop
app.get("/api/farmers", async (req, res) => {
  try {
    const cropName = req.query.crop;
    const farmers = await Farmer.find({ crop: cropName });
    res.json(farmers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching farmers" });
  }
});

app.listen(3000, () => console.log("🚀 Server running on http://localhost:3000"));
