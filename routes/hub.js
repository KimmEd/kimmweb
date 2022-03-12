const express = require("express"),
  router = express.Router(),
  expressLayouts = require("express-ejs-layouts");

const { checkAuthenticated } = require("../checkAuth");
router.use(expressLayouts);
router.use(checkAuthenticated);

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

router.get("/classes", (req, res) => {
  const Classrooms = require("../models/class"),
    User = require("../models/user");
  Classrooms.find(
    {
      $or: [{ classTeacher: req.user.id }, { classStudents: req.user.id }],
    },
    async (err, classes) => {
      if (err) {
        console.log(err + ": " + "Error finding classes");
        return;
      }
      const trueClass = await Promise.all(
        classes.map(async (classroom) => {
          return {
            owner: await User.findById(classroom.classTeacher),
            ...classroom._doc,
          };
        })
      );
      res.render("pages/classMenu", {
        layout: "layouts/hubLayout",
        data: {
          elements: [
            { type: "css", path: "css/sidebar.css" },
            { type: "css", path: "/css/classes.css" },
          ],
          title: "Kimm - Classes",
        },
        page: "classes",
        classes: trueClass,
      });
    }
  );
});

router.use("/class", require("./class"));

module.exports = router;
