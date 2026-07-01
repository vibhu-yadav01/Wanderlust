if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
};

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo").default || require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");


const dbUrl = process.env.ATLASDB_URL;
// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust"


async function main() {
    try {
        await mongoose.connect(dbUrl);
        console.log("✅ Connected to MongoDB");
    } catch (err) {
        console.log(err);
    }
}

main();



app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);

// Trust proxy for Render deployments
app.set("trust proxy", 1);


const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 3600 // time period in seconds
});

store.on("error", (err) => {
    console.log("ERROR in MONGO SESSION STORE", err);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET || "thisshouldbeabettersecret",
    resave: false,
    saveUninitialized: false,
    cookie:{
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
};

// app.get("/", (req,res)=>{
//     res.send("Hi, I am root");
// });

// main().then(()=>{
//     console.log("connect to DB")
// })
// .catch((err)=>{
//     console.log(err);
// });
app.get("/", (req, res) => {
    res.redirect("/listings");
});

app.get("/test", (req, res) => {
    res.send("Server is working!");
});
app.use(express.static(path.join(__dirname, "/public")));
app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use((req, res, next) => {
    console.log("[TRACE] Before passport.session(): req.user =", req.user);
    next();
});
app.use(passport.session());
app.use((req, res, next) => {
    console.log("[TRACE] After passport.session(): req.user =", req.user);
    next();
});
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    console.log("[TRACE] Inside middleware setting res.locals.currUser");
    console.log("[TRACE] req.method =", req.method, "req.url =", req.url);
    console.log("[TRACE] req.user =", req.user);
    console.log("[TRACE] res.locals =", res.locals);
    next();
})

// app.get("/demo", async(req, res)=>{
//     let fakeuser = new User({
//         email: "student@gmail.com",
//         username: "Rahul"
//     });

//     let registeredUser= await User.register(fakeuser, "HelloWorld");
//     res.send(registeredUser);
// })

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);


app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

// Error handler
app.use((err, req, res, next) => {
    console.error("======== ERROR ========");
    console.error(err);
    console.error(err.stack);

    res.status(err.statusCode || 500).send(`
        <h1>Error</h1>
        <pre>${err.stack}</pre>
    `);
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
