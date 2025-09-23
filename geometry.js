// updateGeometry.js (use for normlize the geometry)

const { MongoClient } = require("mongodb");
const axios = require("axios");

async function run() {
  const uri = "mongodb://127.0.0.1:27017"; // ✅ your MongoDB URI
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("DB_NAME"); // ✅ change if DB name is different
    const listings = db.collection("listings");

    // Function to fetch coordinates from Nominatim
    async function getCoordinates(location) {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`;
      const res = await axios.get(url, { headers: { "User-Agent": "wanderlust-app" } });
      if (res.data && res.data[0]) {
        return {
          type: "Point",
          coordinates: [parseFloat(res.data[0].lon), parseFloat(res.data[0].lat)]
        };
      }
      return null;
    }

    // ✅ Update all listings (not skipping existing geometry)
    const cursor = listings.find({});
    for await (const doc of cursor) {
      if (!doc.location) {
        console.log(`⚠️ Skipped: ${doc._id} has no location`);
        continue;
      }

      const geo = await getCoordinates(doc.location);
      if (geo) {
        await listings.updateOne(
          { _id: doc._id },
          { $set: { geometry: geo } }
        );
        console.log(`✅ Updated ${doc.location} → ${JSON.stringify(geo)}`);
      } else {
        console.log(`⚠️ Could not geocode: ${doc.location}`);
      }
    }

    console.log("🎉 Geometry updated for all listings!");
  } finally {
    await client.close();
  }
}

run().catch(console.dir);
