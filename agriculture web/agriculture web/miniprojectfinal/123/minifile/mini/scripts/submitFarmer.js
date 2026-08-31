const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://jahnavinaik5656_db_user:GOLf0V4zHTqRWDQc@farmercluster.8mipi12.mongodb.net/FarmerApp?retryWrites=true&w=majority";


async function submitFarmer() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db("FarmerApp");
    const farmers = database.collection("farmers");

    // Example data to submit
    const newFarmer = {
      name: "Ramesh",
      age: 35,
      crops: ["wheat", "corn"],
      location: "Village A"
    };

    const result = await farmers.insertOne(newFarmer);

    console.log("✅ Farmer submitted with ID:", result.insertedId);

  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error);
  } finally {
    await client.close();
  }
}

submitFarmer();
