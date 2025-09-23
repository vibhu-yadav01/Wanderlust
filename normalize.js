// // normalizeImages.js
// const mongoose = require("mongoose");
// const Listing = require("./models/listing.js");

// const MONGO_URL = "mongodb://127.0.0.1:27017/DB_NAME";

// async function main() {
//   await mongoose.connect(MONGO_URL);
//   console.log("Connected to DB");

//   const listings = await Listing.find({});
//   for (let listing of listings) {
//     if (typeof listing.image === "string") {
//       listing.image = {
//         filename: "default",
//         url: listing.image
//       };
//       await listing.save();
//       console.log(`Updated listing: ${listing.title}`);
//     }
//   }

//   console.log("✅ All images normalized");
//   mongoose.connection.close();
// }

// main();
