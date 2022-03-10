const express = require("express"),
  router = express.Router(),
  expressLayouts = require("express-ejs-layouts");

const {checkAuthenticated} = require('../checkAuth');
router.use(expressLayouts);

router.get("/", (req, res) => {
  res.render("pages/hub", {
    layout: "layouts/hubLayout",
    data: {
      elements: [{ type: "css", path: "css/sidebar.css" }],
      title: "Kimm",
    },
    page: "main",
  });
});

router.get("/login", (req, res) => {
  if (req.query.type === "register") {
    res.render("pages/login", { register: true });
  } else {
    res.render("pages/login", { register: false });
  }
});

router.post("/login", (req, res) => {
  res.sendStatus(200);
  // TODO: Work with database to handle login and register.
});

router.get("/classes", (req, res) => {
  const classesInfo = require("../resources/classes.json"),
  classes = Object.values(classesInfo);
  res.render("pages/classMenu", {
    layout: "layouts/hubLayout.ejs",
    data: {
      elements: [{ type: "css", path: "/css/sidebar.css" }, { type: "css", path: "/css/classes.css"}],
      title: "Kimm - Classes",
    },
    page: "classes",
    classes
  });
});

router.get('/class/:id', (req, res) => {
  console.log(req.params.id);
  res.sendStatus(200);
})

module.exports = router;
