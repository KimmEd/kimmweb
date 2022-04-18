const express = require("express"),
  router = express.Router();

const { checkAuthenticated } = require("../middleware/checkAuth"),
  Class = require("../models/class"),
  User = require("../models/user");

router.use(checkAuthenticated);
router.get("/", (req, res) => {
  res.redirect("/hub");
});

router.get("/list", (req, res) => {
  Class.find({}, (err, classes) => {
    if (err) {
      req.flash("error", "Error loading classes");
      return;
    }
    res.render("pages/list", { classes });
  });
});

// TODO: Just upload and save the file to the database instead of using fucking url.
router
  .route("/add")
  .get((req, res) => {
    res.render("pages/addClass", {
      layout: "layouts/hubLayout",
      data: {
        elements: [],
        title: "Add a Class - Kimm",
      },
      page: "addClass",
    });
  })
  .post(async (req, res) => {
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
      req.flash(
        "success",
        `The following emails were not found: ${notFound.join(" ")}`
      );
      res.redirect("/hub");
    } catch (err) {
      req.flash("error", "Error adding class");
      res.redirect("/hub/add");
    }
  });

router
  .route("/id/:id")
  .get((req, res) => {
    const classCards = require("../models/classCards");
    const { id } = req.params;
    Class.findById(id).exec((err, classObj) => {
      if (err || !classObj) {
        req.flash("error", "Class not found");
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
              { type: "js", path: "/js/display.js" },
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
          req.flash("error", "Error adding post");
          return res.redirect(`/hub/class/id/${id}`);
        } else {
          res.redirect(`/hub/class/id/${id}`);
        }
      });
    }
  });

router.post("/id/:id/feedback", (req, res) => {
  const { id } = req.params;
  console.log(req.body);
  req.flash("success", "Feedback submitted, value: " + req.body.res);
  res.redirect(`/hub/class/id/${id}`);
});

router
  .route("/id/:id/study-sets")
  .get((req, res) => {
    const { id } = req.params,
      Class = require("../models/class");
    let studySets = [];
    Class.findById(id).exec((err, classObj) => {
      if (err || !classObj) {
        req.flash("error", "Class not found");
        return res.redirect("/hub");
      }
      if (!classObj.studysets) {
        studySets = false;
        return
      }
      studySets = classObj.studysets;
      res.render("pages/manageSets", {
        layout: "layouts/hubLayout",
        data: {
          elements: [
            { type: "css", path: "/css/studySet.css" },
            { type: "js", path: "/js/flashcards.js" },
            { type: "js", path: "/js/display.js" },
          ],
          title: "Study Set - Kimm",
        },
        studysets: studySets,
        page: "studySet",
        id: req.params.id,
        author: req.user.id,
      });
    })
  })
  .post((req, res) => {
    const { id } = req.params;
    const { name, description, flashcard: flashcards } = req.body;
    console.log({ ...req.body });
    
    // #region Validation

    if (!(name && description && flashcards)) {
      req.flash("error", "Please fill in all fields");
      return res.redirect(`/hub/class/id/${id}/study-sets`);
    }

    flashcards.forEach((flashcard) => {
      if (!flashcard.term || !flashcard.definition || !flashcard.author) {
        req.flash("error", "Please fill in all the flashcard fields");
        return res.redirect(`/hub/class/id/${id}/study-sets`);
      }

      if (flashcard.interchangeable) {
        flashcard.interchangeable = true;
      }
    });

    // #endregion
    
    const Class = require("../models/class");
    Class.findById(id).exec((err, classObj) => {
      if (err || !classObj) {
        req.flash("error", "Class not found");
        return res.redirect("/hub");
      }
      if (!classObj.studysets) {
        classObj.studysets = [];
      }
      classObj.studysets.push({
        name,
        description,
        flashcards,
      });
      classObj.save((err) => {
        if (err) {
          req.flash("error", "Error adding study set");
          return res.redirect(`/hub/class/id/${id}/study-sets`);
        } else {
          req.flash("success", "Study set added");
          return res.redirect(`/hub/class/id/${id}/study-sets`);
        }
      });
    });
  });

router.route('/id/:id/study-sets/:studySetId')
  .get((req, res) => {
    const { id, studySetId } = req.params;
    const Class = require("../models/class");
    Class.findById(id).exec((err, classObj) => {
      if (err || !classObj) {
        req.flash("error", "Class not found");
        return res.redirect("/hub");
      }
      if (!classObj.studysets) {
        req.flash("error", "No study sets found");
        return res.redirect(`/hub/class/id/${id}/study-sets`);
      }
      const [currentSS] = classObj.studysets.filter(set => set.id === studySetId)

      // if no study set found
      if (!currentSS) {
        req.flash("error", "Study set not found");
        return res.redirect(`/hub/class/id/${id}/study-sets`);
      }
      res.render("pages/studySet", {
        layout: "layouts/hubLayout",
        data: {
          elements: [
            { type: "css", path: "/css/studySet.css" },
          ],
          title: "Study Set - Kimm",
        },
        studyset: currentSS,
        page: "studySet",
        id
      });
    })
  })
  // Submit study set scores
  // .post((req, res) => {})

// TODO: Add a route to leave class
module.exports = router;
