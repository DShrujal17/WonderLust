const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejs_mate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync");
const ExpressError = require("./utils/ExpressError.js");
const { error } = require("console");
const {listingSchema , reviewSchema} = require("./schema.js");
const Review = require("./models/review.js");


app.engine('ejs',ejs_mate);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,"/public")));
app.use(express.urlencoded({ extended: true }));

main()
.then(() => console.log("MongoDB connection successful"))
.catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wonderLust');
}

app.get("/",(req,res) => {
    res.send("server is working");
});

const validateListing = (req,res,next) => {
  const {error} = listingSchema.validate(req.body);
  if(error){
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400,errMsg);
  }
  else
    next();
}

const validateReview = (req,res,next) => {
  const {error} = reviewSchema.validate(req.body);
  if(error){
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400,errMsg);
  }
  else
    next();
}

// Index Route
app.get("/listings",wrapAsync (async (req,res) => {
   const allListings = await Listing.find({});
   res.render("listings/index.ejs",{allListings});
}));

//New Route
app.get("/listings/new",(req,res) => {
    res.render("listings/new.ejs");
});

// Show Route
app.get("/listings/:id", 
  wrapAsync (async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    console.log("Listing details:", listing);
    res.render("listings/show.ejs",{listing});
  })
);

//Create Route
app.post("/listings",
  validateListing,
  wrapAsync (async (req, res , next) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
  })
);

//Edit Route
app.get("/listings/:id/edit", 
  wrapAsync (async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
  })
);

//Update Route
app.put("/listings/:id", 
  validateListing,
  wrapAsync (async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
  })
);

//Delete Route
app.delete("/listings/:id", 
  wrapAsync (async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
  })
);

// Reviews Post Route
app.post("/listings/:id/reviews", validateReview , wrapAsync(async (req,res) => {
 let listing = await Listing.findById(req.params.id);
 let newReview = new Review(req.body.review);

 listing.reviews.push(newReview);

 await newReview.save();
 await listing.save();

 res.redirect(`/listings/${listing._id}`);
}));


// app.get("/testListing", async (req,res) => {
//     let sampleListing = new Listing(
//         {
//             title : "My new Villa",
//             description : "By the Beach",
//             price : 1200,
//             location : "Calangute,Goa",
//             country : "India",
//         }
//     );

//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successful testing");
// });

// app.all("*",(req,res,next) => {
//   next(new ExpressError(404,"Page Not Found!"));
// });

// Middleware for Create Route
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error.ejs",{err});
  // res.status(statusCode).send(message);
});


app.listen(8080,() => {
    console.log("server is listening to port 8080");
});