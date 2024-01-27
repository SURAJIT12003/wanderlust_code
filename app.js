
if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}
 
const express = require("express");
const app = express();
const port = 7000;
const mongoose = require('mongoose');
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema ,reviewSchema } = require("./schema.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const { isLoggedIn } = require("./middleware.js");
const dbUrl = process.env.ATLAS_URL;

const reviewsRouter = require("./routes/review.js");
const listingsRouter = require("./routes/listing.js");
const userRouter = require("./routes/user.js");
const { log } = require('console');
const listingController = require("./controllers/listing.js");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")))

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})



main().then(() => {
    console.log("connect ");
})
    .catch(err => console.log(err));

async function main() {
    await mongoose.connect(dbUrl);
}


const store = MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter:24*3600,
})

store.on("error",()=>{
    console.log("ERROR in MONGO DB SESSION",err);
})

const sessionOptions = {
    store,
    secret:process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie:{
        expires: Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true
    }
};




app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser  = req.user;
    next();
})  


// app.use("/",(req,res)=>{
//     res.render("listings/home.ejs");
// });

app.use("/listings/companydetails",listingController.company);

app.use("/listings/payment",isLoggedIn,listingController.payment); // Payment router

app.use("/listings",listingsRouter);

app.use("/listings/:id/reviews",reviewsRouter);

app.use("/",userRouter);

app.use("/",(req,res)=>{
    res.redirect("/listings");
});

// Other rout 
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not found!"));
})


// Error MiddleWare 
app.use((err, req, res, next) => {
    let { status = 404, message = "Somehing went wrong" } = err;
    //res.send(message).status(status);
    res.render("error.ejs", { message });

}) 