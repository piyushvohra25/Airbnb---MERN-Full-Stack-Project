const express = require("express");
const wrapAsync = require("../utils/wrapAsync.js");
const router = express.Router();
const passport = require("passport");
const userController = require("../controllers/user.js");
const {saveRedirectUrl} = require("../middleware.js");

router.route("/signup")
    .get(userController.signupForm)
    .post(wrapAsync(userController.signup));

router.route("/login")
    .get(userController.loginForm)
    .post(saveRedirectUrl,
    passport.authenticate("local",
        {failureRedirect: "/users/login", failureFlash: true}),
        wrapAsync(userController.login));

router.get("/logout",userController.logout);

module.exports = router;