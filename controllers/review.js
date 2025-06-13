const Listing = require("../models/listing.js");
const Review = require("../models/review.js");



// create review 
// module.exports.createReview  = async (req, res) => {
//     let id = req.params.id;
//     let listing = await Listing.findById(req.params.id);
//     let newReview = new Review(req.body.review);
//     newReview.author = req.user._id;
//     // console.log(newReview);
//     listing.reviews.push(newReview);
    
//     await newReview.save();
//     await listing.save();
//     req.flash("success","New Review Add!");
//     res.redirect(`/listings/${id}`);
// }


// CREATE REVIEW---NEW ****
module.exports.createReview = async (req, res) => {
    let id = req.params.id;
    let listing = await Listing.findById(id).populate("reviews");

    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;

    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();

    // Recalculate averageRating
    const totalRating = listing.reviews.reduce((sum, review) => sum + review.rating, 0);
    listing.averageRating = totalRating / listing.reviews.length;
    await listing.save();

    req.flash("success", "New Review Added!");
    res.redirect(`/listings/${id}`);
};

//delete review 
// module.exports.destroyReview  = async (req, res) => {
//     let { id, reviewId } = req.params;

//     await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

//     await Review.findByIdAndDelete(reviewId);
//     req.flash("success","Review Deleted!");
//     res.redirect(`/listings/${id}`);
// }



// DELETE REVIEW----NEW****
module.exports.destroyReview = async (req, res) => {
    const { id, reviewId } = req.params;

    // Remove the review reference from the listing
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

    // Delete the review
    await Review.findByIdAndDelete(reviewId);

    // Recalculate averageRating
    let listing = await Listing.findById(id).populate("reviews");

    if (listing.reviews.length > 0) {
        const totalRating = listing.reviews.reduce((sum, review) => sum + review.rating, 0);
        listing.averageRating = totalRating / listing.reviews.length;
    } else {
        listing.averageRating = 0;
    }

    await listing.save();

    req.flash("success", "Review Deleted!");
    res.redirect(`/listings/${id}`);
};
