const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { listingSchema, reviewSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const { isLoggedIn } = require("../middleware.js");
const listingController = require("../controllers/listing.js");
const multer = require('multer');
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });


// Middleware validate listing schema
const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(404, errMsg);
    }
    else {
        next();
    }
}


router.route("/").
    get(wrapAsync(listingController.index)). // All listings(Home) ***********
    post(isLoggedIn,upload.single("listing[image]"),validateListing, wrapAsync(listingController.createListing)); //add post 



// Create new Post *****************
router.get("/new", isLoggedIn, listingController.renderNewForm);


router.route("/:id").
    get(wrapAsync(listingController.showListing)). //Show Specific Listings ************
    put(isLoggedIn, upload.single("listing[image]"),validateListing, wrapAsync(listingController.updateListing)). //update data
    delete(isLoggedIn, wrapAsync(listingController.destroyListing));   //Delete list ***********



//Edit listing **************
router.get("/:id/edit", isLoggedIn, wrapAsync(listingController.renderEditForm));

module.exports = router;