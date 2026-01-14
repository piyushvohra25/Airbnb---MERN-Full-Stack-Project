if(process.env.NODE_ENV != "production") {
    require("dotenv").config();
}

// REQUIRES
const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");

let dbURL = process.env.ATLAS;

// DATABASE CONNECTION
const mongoose = require("mongoose");
main()
.then(() => {
    console.log("connected to DB");
})
.catch((err) => {
    console.log(err);
});
async function main() {
    await mongoose.connect(dbURL);
};

// PASSPORT
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

// FLASHS
const flash = require("connect-flash");

app.use(flash());

// EXPRESS-SESSIONS
const session = require("express-session");

const MongoStore = require("connect-mongo").default;

const store = new MongoStore({
    mongoUrl: dbURL,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

store.on("error", () => {
    console.log("error in mongo session store",err);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};

app.use(session(sessionOptions));

// PASSPORT CONFIGURATION STRATEGY
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// LOCAL MIDDLEWARE
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// REQUIRING ROUTE FILES
const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");
const user = require("./routes/user.js");

// EJS
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.engine("ejs",ejsMate);

// USE
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,"/public")));

// ROUTES
app.use("/listings",listings);
app.use("/listings/:id/reviews",reviews);
app.use("/users",user);

// Handling of NON-EXISTING ROUTES
app.all(/.*/,(req, res, next) => {
    next(new ExpressError(404,"Page not found!"));
});

// ERROR HANDLING
app.use((err, req, res, next) => {
    let {status=500, message="something went wrong!!!"} = err;
    res.status(status).render("listings/error.ejs",{message});
});

// LISTENING TO PORT 8080
app.listen(8080,() => {
    console.log("server listening to port 8080");
});