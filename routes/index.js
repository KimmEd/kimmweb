const express = require("express"),
  router = express.Router(),
  bcrypt = require("bcrypt"),
  User = require("../models/user"),
  passport = require("passport");

router.get("/", (req, res) => {
  res.render("pages/index");
});

router.get("/login", (req, res) => {
  res.render("pages/login");
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/hub",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

router.get("/register", (req, res) => {
  res.render("pages/register");
});

router.post("/register", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    let user = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
      avatar: req.body.avatar || "",
    });
    await user.save();
  } catch {
    res.redirect("/register");
  }
});

module.exports = router;
