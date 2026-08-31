const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://jahnavinaik5656_db_user:GOLf0V4zHTqRWDQc@farmercluster.8mipi12.mongodb.net/FarmerApp?retryWrites=true&w=majority";

async function submitAndFetch() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db("FarmerApp");
    const farmers = database.collection("farmers");

    // 1️⃣ Submit a new farmer
    const newFarmer = {
      name: "Suresh",
      age: 40,
      crops: ["rice", "maize"],
      location: "Village B"
    };

    const insertResult = await farmers.insertOne(newFarmer);
    console.log("✅ Farmer submitted with ID:", insertResult.insertedId);

    // 2️⃣ Fetch all farmers
    const allFarmers = await farmers.find({}).toArray();
    console.log("📋 All farmers:");
    allFarmers.forEach(farmer => {
      console.log({
        name: farmer.name,
        age: farmer.age,
        crops: farmer.crops,
        location: farmer.location
      });
    });

  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error);
  } finally {
    await client.close();
  }
}

submitAndFetch();
