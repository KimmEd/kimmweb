const express = require("express"),
  router = express.Router();

const { checkAuthenticated } = require("../middleware/checkAuth");
router.use(checkAuthenticated);

router.get("/", (req, res) => {
  res.render("pages/hub", {
    layout: "layouts/hubLayout",
    data: {
      elements: [],
      title: "Kimm Hub",
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
        req.flash("error", "Error loading classes");
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
          elements: [{ type: "css", path: "/css/classMenu.css" }],
          title: "Kimm - Classes",
        },
        classes: trueClass,
      });
    }
  );
});

router.use("/class", require("./class"));

module.exports = router;
