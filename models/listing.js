// models/listing.js
const mongoose = require("mongoose");
const { listingSchema } = require("../schema");
const Schema = mongoose.Schema;
const Review = require("./review.js");
const { ref, string } = require("joi");

const ListingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    filename: {
      type: String,
      default: "default"
    },
    url: {
      type: String,
      default: "https://thumbs.dreamstime.com/b/romanian-hillside-village-summer-time-mountain-landscape-transylvania-romania-romanian-hillside-village-summer-120917479.jpg?w=768",
      set: function(value) {
        if (!value) {
          return "https://thumbs.dreamstime.com/b/romanian-hillside-village-summer-time-mountain-landscape-transylvania-romania-romanian-hillside-village-summer-120917479.jpg?w=768";
        }
        if (!value.startsWith('http://') && !value.startsWith('https://')) {
          return 'https://' + value;
        }
        return value;
      }
    }
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  location: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  reviews:[
    {
      type: Schema.Types.ObjectId,
      ref: "Review",

    }
  ],
  owner:{
    type: Schema.Types.ObjectId,
    ref:"User",
  },
  geometry: {
  type: {
    type: String,
    enum: ['Point'],
    required: true
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true
  }
},
category: {
  type: [String], 
  enum: [
    "trending",
    "rooms",
    "iconicCites",
    "mountains",
    "castles",
    "pools",
    "camping",
    "farms",
    "arctic",
    "beach",
    "forest"
  ],
  default: []
}


});

ListingSchema.post("findOneAndDelete", async(listing)=>{
  if(listing){
    await Review.deleteMany({_id: {$in: listing.reviews}});
  }
  
})

module.exports = mongoose.model('Listing', ListingSchema);
