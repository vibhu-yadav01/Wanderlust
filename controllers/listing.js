const Listing = require("../models/listing");
const axios = require("axios");

// controller/listing.js
module.exports.index = async (req, res) => {
    const category = req.query.category ? req.query.category.toString() : undefined; //for filter
    const search = req.query.q ? req.query.q.trim() : undefined; // for search

    let filter = {};

    // let allListings;

    if (category) {
    filter.category = { $in: [category] };
    }

    if (search) {
    // Search in title, description, or location
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
      { country: { $regex: search, $options: "i" } }
    ];
  }

  const allListings = await Listing.find(filter);
    res.render("listings/index.ejs", { allListings, category,search });
    };


module.exports.renderNewForm = (req, res)=>{
    res.render("listings/new.ejs");
};

module.exports.show= async(req, res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id).populate({path: "reviews",populate:{ path:"author",},
    }).populate("owner");
    if(!listing){
        req.flash("error", "Listing you reuested for does not exist!");
       return res.redirect("/listings"); // Added return
    }
    res.render("listings/show.ejs", {listing});
}

module.exports.createListing = async (req, res, next)=>{

    const location = req.body.listing.location;
    let url = req.file.path;
    let filename = req.file.filename;
    
    if (req.body.listing.category && !Array.isArray(req.body.listing.category)) {
        req.body.listing.category = [req.body.listing.category];
    }

    const newlisting = new Listing(req.body.listing);
    const saveList = await newlisting;
    console.log(saveList);
    // Call OpenStreetMap's Nominatim API
    let response;
    try {
    response = await axios.get("https://nominatim.openstreetmap.org/search", {
        params: {
        q: location,
        format: "json",
        limit: 1
        },
        headers: {
        "User-Agent": "YourAppName/1.0 (your-email@example.com)" // required by Nominatim
        }
    });
    } catch (err) {
    console.error("Geocoding failed:", err.message);
    response = { data: [] }; // fallback empty response
    }


    if (response.data.length > 0) {
    let data = response.data[0];
    newlisting.geometry = {
        type: "Point",
        coordinates: [parseFloat(data.lon), parseFloat(data.lat)]
    };
    } else {
    // fallback: no coordinates
    newlisting.geometry = {
        type: "Point",
        coordinates: [0, 0]
    };
    }



    newlisting.owner = req.user._id;
    newlisting.image = {url,filename};
    await newlisting.save(); // <-- don’t forget to actually save
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};

module.exports.editListing = async(req, res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing you reuested for does not exist!");
        return res.redirect("/listings"); // Added return
    }
    let originalImageUrl=listing.image.url;
    originalImageUrl= originalImageUrl.replace("/upload", "/upload/w_250");
    res.render("listings/edit.ejs", {listing, originalImageUrl});
};

module.exports.updateListing =async (req, res)=>{
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate
    (id, {...req.body.listing});

    if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url,filename };
        await listing.save();
    }
    

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async(req, res)=>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};