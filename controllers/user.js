
const User = require("../models/user");


// render sign up form 
module.exports.renderSignupForm = (req, res) => {
    res.render("./users/signup.ejs");
}


//Sign up 
module.exports.signup  = async (req, res) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new User({
            email,
            username

        })

        const registerUSer = await User.register(newUser, password);
      
        req.login(registerUSer,(err)=>{
            if(err){
                return next(err);
            }
            req.flash("success", "Welcome to our Wanderlust Family !");
            res.redirect("/listings");
        })
        
    }
    catch(err){
        req.flash("error", err.message);
        res.redirect("/signup");
    }
   
}


//render log in form 
module.exports.renderLoginForm = async (req,res)=>{
    res.render("./users/login.ejs");
}

//Log in 
module.exports.login = async(req,res)=>{
    let {username} = req.body;
    req.flash("success",`Welcome back to Wanderlust ! ${username} You are logged in` )

    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
}


//log out 
module.exports.logout = (req,res,next)=>{
    req.logOut( (err) =>{
        if(err){
            return next(err);
        }
        req.flash("success","You are Log out");
        res.redirect("/listings");

    })
}