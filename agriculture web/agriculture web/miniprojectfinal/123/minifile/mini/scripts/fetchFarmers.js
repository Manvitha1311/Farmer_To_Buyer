const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = "mongodb+srv://jahnavinaik5656_db_user:GOLf0V4zHTqRWDQc@farmercluster.8mipi12.mongodb.net/FarmerApp?retryWrites=true&w=majority";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function fetchFarmers() {
  try {
    await client.connect();
    const db = client.db("FarmerApp");
    const farmers = db.collection("farmers");

    const allFarmers = await farmers.find({}).toArray();
    console.log("📋 All farmers:");
    console.log(allFarmers);
  } catch (err) {
    console.error("❌ Error connecting to MongoDB:", err.message);
  } finally {
    await client.close();
  }
}

fetchFarmers();
