// ✅ Import dependencies
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { MongoClient, ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");

// ✅ App setup
const app = express();
const PORT = 3000;

// ✅ Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ MongoDB connection
const uri =
  "mongodb+srv://jahnavinaik5656_db_user:GOLf0V4zHTqRWDQc@farmercluster.8mipi12.mongodb.net/FarmerApp?retryWrites=true&w=majority";

const client = new MongoClient(uri);
let db, farmersCollection, usersCollection, buyersCollection;

async function connectDB() {
  try {
    await client.connect();
    db = client.db("FarmerApp");
    farmersCollection = db.collection("farmers");
    usersCollection = db.collection("users");
    buyersCollection = db.collection("buyers");
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
}
connectDB();

/* =======================================================================================
   👤 SIGNUP
======================================================================================= */
app.post("/api/signup", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ message: "All fields are required" });

  try {
    const existing = await usersCollection.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    await usersCollection.insertOne({
      name,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    });

    res.status(201).json({ message: "Signup successful" });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/* =======================================================================================
   🔑 LOGIN
======================================================================================= */
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "All fields are required" });

  try {
    const user = await usersCollection.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ message: "Invalid password" });

    res.status(200).json({ message: "Login successful", user });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/* =======================================================================================
   🌾 Sell Crop (Status Added)
======================================================================================= */
app.post("/api/farmers", async (req, res) => {
  const { crop, name, location, contact, price } = req.body;

  if (!crop || !name || !location || !contact || !price)
    return res.status(400).json({ message: "All fields required" });

  try {
    const result = await farmersCollection.insertOne({
      crop,
      name,
      location,
      contact,
      price: Number(price),
      status: "available",
      sold: false,
      soldToId: null,
      date: new Date(),
    });

    console.log("✅ Crop submitted:", result.insertedId);
    res.status(201).json({ 
      message: "Crop submitted successfully!",
      farmerId: result.insertedId 
    });
  } catch (err) {
    console.error("Insert Error ❌", err.message);
    res.status(500).json({ message: "Error submitting crop details: " + err.message });
  }
});

/* =======================================================================================
   🌿 Get All Available Crops (For Buyers)
======================================================================================= */
app.get("/api/farmers", async (req, res) => {
  try {
    const crops = await farmersCollection
      .find({ sold: false })
      .sort({ date: -1 })
      .toArray();

    console.log("✅ Crops fetched:", crops.length);
    res.status(200).json(crops);
  } catch (err) {
    console.error("Fetch Error ❌", err.message);
    res.status(500).json({ message: "Error fetching crops: " + err.message });
  }
});

/* =======================================================================================
   👥 Register Buyer and Mark Crop as Sold - ⭐ CRITICAL ENDPOINT
======================================================================================= */
app.post("/api/buyers", async (req, res) => {
  console.log("📨 Buyer registration request received:", req.body);

  const { name, contact, location, farmerId, crop, farmerName } = req.body;

  // ⭐ Detailed validation
  if (!name) return res.status(400).json({ message: "Buyer name is required" });
  if (!contact) return res.status(400).json({ message: "Contact number is required" });
  if (!location) return res.status(400).json({ message: "Location is required" });
  if (!farmerId) return res.status(400).json({ message: "Farmer ID is missing" });
  if (!crop) return res.status(400).json({ message: "Crop name is missing" });
  if (!farmerName) return res.status(400).json({ message: "Farmer name is missing" });

  try {
    // ⭐ Validate farmerId is a valid MongoDB ObjectId
    if (!ObjectId.isValid(farmerId)) {
      console.error("❌ Invalid farmer ID format:", farmerId);
      return res.status(400).json({ message: "Invalid farmer ID format" });
    }

    const farmerObjectId = new ObjectId(farmerId);

    // ⭐ Check if farmer exists
    const farmerExists = await farmersCollection.findOne({ _id: farmerObjectId });
    if (!farmerExists) {
      console.error("❌ Farmer not found:", farmerObjectId);
      return res.status(404).json({ message: "Farmer not found in database" });
    }

    console.log("✅ Farmer found:", farmerExists.name);

    // ⭐ Check if already sold
    if (farmerExists.sold) {
      console.warn("⚠️ Crop already sold");
      return res.status(400).json({ message: "This crop has already been sold" });
    }

    // ⭐ Create buyer record
    const buyerResult = await buyersCollection.insertOne({
      name,
      contact,
      location,
      farmerId: farmerObjectId,
      crop,
      farmerName,
      createdAt: new Date(),
    });

    console.log("✅ Buyer registered:", buyerResult.insertedId);

    // ⭐ Mark farmer's crop as sold
    const updateResult = await farmersCollection.updateOne(
      { _id: farmerObjectId },
      {
        $set: {
          sold: true,
          status: "sold",
          soldToId: buyerResult.insertedId,
          soldAt: new Date(),
        },
      }
    );

    console.log("✅ Farmer crop marked as sold:", updateResult.modifiedCount);

    res.status(201).json({
      message: "Registration successful! Crop marked as sold.",
      buyerId: buyerResult.insertedId,
      farmerId: farmerObjectId,
    });
  } catch (err) {
    console.error("❌ Buyer Registration Error:", err.message);
    res.status(500).json({ message: "Error registering buyer: " + err.message });
  }
});

/* =======================================================================================
   📊 Get All Buyers (For Farmers)
======================================================================================= */
app.get("/api/buyers", async (req, res) => {
  try {
    const buyers = await buyersCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    console.log("✅ Buyers fetched:", buyers.length);
    res.status(200).json(buyers);
  } catch (err) {
    console.error("❌ Fetch Buyers Error:", err.message);
    res.status(500).json({ message: "Error fetching buyers: " + err.message });
  }
});

/* =======================================================================================
   🔔 Notifications API
======================================================================================= */
app.get("/api/notifications", async (req, res) => {
  try {
    const notifications = await farmersCollection
      .find({}, { projection: { name: 1, crop: 1 } })
      .sort({ date: -1 })
      .toArray();

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: "Error fetching notifications" });
  }
});

/* =======================================================================================
   ❌ Error Handling
======================================================================================= */
app.use((err, req, res, next) => {
  console.error("🔥 Unhandled Error:", err);
  res.status(500).json({ message: "Internal Server Error: " + err.message });
});

/* =======================================================================================
   🚀 Start Server
======================================================================================= */
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log("📊 MongoDB connected and ready");
});