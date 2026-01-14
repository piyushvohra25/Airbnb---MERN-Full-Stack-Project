const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");
const listingController = require("../controllers/listing.js");

// MULTER
const multer = require("multer");
const storage = require("../cloudConfig.js");
const upload = multer(storage);

router.route("/")
    .get(wrapAsync(listingController.index)) // INDEX ROUTE
    .post(isLoggedIn, validateListing, 
        upload.single("listing[image]"),
        wrapAsync(listingController.createListing)); // CREATE ROUTE

// NEW ROUTE
router.get("/new", isLoggedIn, listingController.newForm);

router.route("/:id")
    .get(wrapAsync(listingController.showListing)) // SHOW ROUTE
    .put(isLoggedIn,isOwner,
        upload.single("listing[image]"),
        validateListing, 
        wrapAsync(listingController.updateListing)) // UPDATE ROUTE
    .delete(isLoggedIn,isOwner, wrapAsync(listingController.destroyListing)); // DELETE ROUTE

 // EDIT ROUTE
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.editForm));

module.exports = router;