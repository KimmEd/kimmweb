const express = require("express"),
  router = express.Router(),
  bcrypt = require("bcrypt"),
  User = require("../models/user"),
  passport = require("passport");

const {
  checkNotAuthenticated,
  checkAuthenticated,
} = require("../middleware/checkAuth");

router.get("/", (req, res) => {
  res.render("pages/main/index", {
    logged: req.isAuthenticated(),
  });
});

router.get('/about', (req, res) => {
  res.render('pages/main/aboutus');
})

router.get("/login", checkNotAuthenticated, (req, res) => {
  res.render("pages/authentication/login");
});

router.route('/contact').get((req, res) => {
  res.render('pages/main/contact');
}).post((req, res) => {
  const { name, email, message } = req.body;
  const errors = [];
  if (!name || !email || !message) {
    errors.push({ msg: 'Please enter all fields' });
  }
  if (errors.length > 0) {
    req.flash('error', errors);
    res.render('pages/main/contact');
  } else {
    console.log(`${name} ${email} ${message}`);
    req.flash('success', 'Message sent');
    res.redirect('/');
  }
});



router.post(
  "/login",
  checkNotAuthenticated,
  passport.authenticate("local", {
    successRedirect: "/hub",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

router
  .route("/register")
  .get(checkNotAuthenticated, (req, res) => {
    res.render("pages/authentication/register");
  })
  .post(checkNotAuthenticated, async (req, res) => {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      let user = new User();
      user.email = req.body.email;
      user.password = hashedPassword;
      user.username = req.body.username;
      await user.save();
      res.redirect("/login");
    } catch (err) {
      req.flash("error", err.message);
      res.redirect("/register");
    }
  });

router.delete("/logout", checkAuthenticated, (req, res) => {
  req.logOut();
  res.redirect("/login");
});

module.exports = router;
