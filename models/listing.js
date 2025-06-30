const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema(
    {
        title : {
            type : String,
            required : true,
        },
        description : String,
        image : {
            type : String,
            default : "https://unsplash.com/photos/black-sand-beach-with-imposing-mountain-range-vkrbz6xvg_Q",
            set: (v) => v === "" ? "https://unsplash.com/photos/black-sand-beach-with-imposing-mountain-range-vkrbz6xvg_Q" : v,
        },
        price : Number,
        location : String,
        country : String,
    }
);

const Listing = mongoose.model("Listing",listingSchema);
module.exports = Listing;