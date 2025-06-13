const Listing = require("../models/listing.js");
// const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;

// const geocodingClient = mbxGeocoding({ accessToken: mapToken });

// For map coordinates function
async function geocodeCity(city) {
  const apiKey = mapToken; // Your OpenCage API key
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
    city
  )}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.results.length > 0) {
      const result = data.results[0];
      const geo = {
        type: "Point",
        coordinates: [result.geometry.lat, result.geometry.lng],
      };

      return geo; // Return the geographic data
    } else {
      throw new alert("City not found");
    }
  } catch (error) {
   
    return null; // Return null or handle the error appropriately
  }
}



// All listings
module.exports.index = async (req, res) => {
   const { sort } = req.query;
    let allListing;

    if (sort === "price_low") {
        allListing = await Listing.find({}).sort({ price: 1 });
    } else if (sort === "price_high") {
        allListing = await Listing.find({}).sort({ price: -1 });
    } else if (sort === "reviews") {
       allListing = await Listing.aggregate([
            {
                $addFields: {
                    reviewCount: { $size: "$reviews" }
                }
            },
            {
                $sort: { reviewCount: -1 }
            }
        ]);
    } else {
         // Default: Most recent listings (by creation date)
        allListing = await Listing.find({}).sort({ createdAt: -1 });
    }

    res.render("./listings/index.ejs", { allListing });
};


//create listing (GET request)
module.exports.renderNewForm = (req, res) => {
  res.render("./listings/new.ejs");
};


// add listing
module.exports.createListing = async (req, res, next) => {
 
 
  let city = req.body.listing.location;
  let geo = await geocodeCity(city);
  if (!geo) {
    req.flash("error", "City not found Please recreate listing!");
    return res.redirect("/listings");
  }
  let url = req.file.path;
  let filename = req.file.filename;
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };
  newListing.geometry = geo; // geocode coordinates save 
  let save = await newListing.save();
  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};


// show listing
module.exports.showListing = async (req, res) => {
  const id = req.params.id;

  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
   
  if (!listing) {
    req.flash("error", "Your Requested Listing doe's not Exit !");
    res.redirect("/listings");
  }
  //console.log(listing);
  res.render("./listings/show.ejs", { listing });
};


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
};


//update lisitng
module.exports.updateListing = async (req, res) => {
  const id = req.params.id;
  let lisitng = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  //For map update 
  let geo = await geocodeCity(req.body.listing.location);
  if (!geo) {
    req.flash("error", "City not found Please reupdate listing!");
    return res.redirect("/listings");
  }
  lisitng.geometry = geo;
  await lisitng.save();
  
  //for image update 
  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    lisitng.image = { url, filename };
    await lisitng.save();
  }

  req.flash("success", "Update Listing!");
  res.redirect(`/listings/${id}`);
};


//delete listing
module.exports.destroyListing = async (req, res) => {
  const id = req.params.id;
  let deleteList = await Listing.findByIdAndDelete(id);
  // console.log(deleteList);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};


//payment listing
module.exports.payment = async (req, res) => {
  res.render("./listings/book.ejs");
};


//company details
module.exports.company = async (req, res) => {
  res.render("./details/company.ejs");
};


//Search items 
module.exports.search = async (req, res) => {
 const country = req.body;
 const allListing = await Listing.find(country);
 if(allListing.length>0){
   return  res.render("./listings/index.ejs", { allListing });
 }
 else{
  req.flash("error", "Any listing not found from this country name");
  res.redirect("/listings");
 }
 
};

//Tags Search
module.exports.tags = async (req, res) => {
 const tags = req.params;

 const allListing = await Listing.find(tags);
 if(allListing.length>0){
   return  res.render("./listings/index.ejs", { allListing });
 }
 else{
  req.flash("error", "Any listing not found from tag name");
  res.redirect("/listings");
 }

};