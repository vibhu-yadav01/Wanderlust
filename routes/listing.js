const express = require ("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const {isLoggedIn, isOwner,validateListing} = require("../middleware.js");
const listingController = require("../controllers/listing.js");
const multer  = require('multer');
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });


//Index Route & create Route
router.route("/")
.get(wrapAsync(listingController.index))
.post(isLoggedIn,upload.single('listing[image][url]'),validateListing, wrapAsync(listingController.createListing));


//New Route
router.get("/new",isLoggedIn, listingController.renderNewForm);

//show Route , Update Route & Delete Route
router.route("/:id")
.get( wrapAsync(listingController.show))
.put(isLoggedIn,isOwner,upload.single('listing[image][url]'),validateListing, wrapAsync(listingController.updateListing))
.delete(isLoggedIn,isOwner, wrapAsync(listingController.deleteListing));


//Edit Route
router.get("/:id/edit",isLoggedIn,isOwner, wrapAsync(listingController.editListing));


module.exports = router;