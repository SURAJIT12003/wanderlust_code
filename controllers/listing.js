
const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken })


// All listings
module.exports.index = async (req, res) => {
    const allListing = await Listing.find({});
    res.render("./listings/index.ejs", { allListing });

}

//create listing (GET request)
module.exports.renderNewForm = (req, res) => {
    res.render("./listings/new.ejs");
}


// add listing 
module.exports.createListing = async (req, res, next) => {
    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 2
    })
    .send()

    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    newListing.geometry = response.body.features[0].geometry;
    let save  = await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
}


// show listing 
module.exports.showListing = async (req, res) => {
    const id = req.params.id;

    const listing = await Listing.findById(id).populate({ path: "reviews", populate: { path: "author" }, }).populate("owner");
    if (!listing) {
        req.flash("error", "Your Requested Listing doe's not Exit !");
        res.redirect("/listings");
    }
    //console.log(listing);
    res.render("./listings/show.ejs", { listing });
}


//edit (get rqeuest)
module.exports.renderEditForm = async (req, res) => {
    const id = req.params.id;

    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Your Requested Listing doe's not Exit !");
        res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_200,w_250");
    res.render("./listings/edit.ejs", { listing, originalImageUrl });
}

//update lisitng 
module.exports.updateListing = async (req, res) => {
    const id = req.params.id;
    let lisitng = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        lisitng.image = { url, filename };
        await lisitng.save();
    }
    req.flash("success", "Update Listing!");
    res.redirect(`/listings/${id}`);

}


//delete listing 
module.exports.destroyListing = async (req, res) => {
    const id = req.params.id;
    let deleteList = await Listing.findByIdAndDelete(id);
    // console.log(deleteList);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
}

//payment listing 
module.exports.payment = async(req,res)=>{
    res.render("./listings/book.ejs");
}

//company details
module.exports.company = async(req,res)=>{
    res.render("./details/company.ejs");
}
