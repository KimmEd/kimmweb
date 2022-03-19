const express = require("express"),
  router = express.Router();

const { checkAuthenticated } = require("../checkAuth"),
  Class = require("../models/class"),
  User = require("../models/user");

router.use(checkAuthenticated);
router.get("/", (req, res) => {
  res.redirect("/hub");
});

router.get("/list", (req, res) => {
  Class.find({}, (err, classes) => {
    if (err) {
      console.log(err);
      return;
    }
    res.render("pages/list", { classes, messages: { error: false } });
  });
});

router.get("/add", (req, res) => {
  res.render("pages/addClass", {
    layout: "layouts/hubLayout",
    data: {
      elements: [],
      title: "Add a Class - Kimm",
    },
    page: "addClass",
  });
});

router.post("/add", async (req, res) => {
  const { name, description, image, students } = req.body;
  if (!(name && description && image && students))
    return res.redirect("/hub/add");
  let studentsArray = students.toLowerCase().split(" "),
    studentsIds = [],
    notFound = [];
  for (let i = 0; i < studentsArray.length; i++) {
    let student = await User.findOne({ email: studentsArray[i] });
    if (student) studentsIds.push(student._id);
    else notFound.push(studentsArray[i]);
  }

  try {
    let classObj = new Class({
      name,
      description,
      image,
      students: studentsIds,
      classTeacher: req.user.id,
    });
    await classObj.save();
    console.error(notFound);
    res.redirect("/hub");
  } catch (err) {
    console.error(err.message);
    res.redirect("/hub/add");
  }
});
router
  .route("/id/:id")
  .get((req, res) => {
    const classCards = require("../models/classCards");
    const { id } = req.params;
    Class.findById(id, (err, classObj) => {
      if (err) {
        req.flash("success", "Class not found");
        return res.redirect("/hub");
      }
      classCards.findByClassId(id).exec((err, cards) => {
        if (err) {
          req.flash("success", "No post found");
          return;
        }

        res.render("pages/class", {
          layout: "layouts/hubLayout",
          data: {
            elements: [
              { type: "css", path: "/css/class.css" },
              { type: "js", path: "/js/classFunctions.js" },
            ],
            title: `${classObj.name} - Kimm`,
          },
          page: "class",
          classroom: classObj,
          cards,
          id: req.params.id,
        });
      });
    });
  })
  .delete(async (req, res) => {
    const { id } = req.params;
    // Find class owner
    try {
      let classObj = await Class.findById(id);
      if (classObj.classTeacher.toString() === req.user.id) {
        await Class.findByIdAndDelete(id);
        // Flash success message
        req.flash("success", "Class deleted");
        res.redirect("/hub");
      } else {
        res.redirect("/hub");
      }
    } catch (err) {
      req.flash("success", err.message);
      res.redirect("/hub");
    }
  });

router
  .route("/id/:id/post")
  .get((req, res) => {
    res.render("pages/classPost", {
      layout: "layouts/hubLayout",
      data: {
        elements: [],
        title: "Class Post - Kimm",
      },
      page: "classPost",
      id: req.params.id,
    });
  })
  .post((req, res) => {
    const { id } = req.params;
    const { title, description, media, cardText: text } = req.body;
    console.log(title, description, media, text);
    if (!(title && description && text))
      return res.redirect(`/hub/class/id/${id}/post`);
    else {
      const ClassCard = require("../models/classCards");
      const newCard = new ClassCard({
        classId: id,
        cardType: "post",
        content: {
          title,
          description,
          media: media ?? undefined,
          cardText: text,
        },
        authorId: req.user.id,
      });

      newCard.save((err) => {
        if (err) {
          console.log(err.message);
          res.render("/hub/class/id/:id/post", {
            layout: "layouts/hubLayout",
            data: {
              elements: [],
              title: "Class Post - Kimm",
            },
            page: "classPost",
            id: req.params.id,
            error: err.message,
          });
        } else {
          res.redirect(`/hub/class/id/${id}`);
        }
      });
    }
  });

// TODO: Add a route to submit feedback
// TODO: Add a route to leave class
module.exports = router;
