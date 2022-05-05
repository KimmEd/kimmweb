import express from 'express';

const router = express.Router();

import Classrooms from '../models/classModel.js';
import User from '../models/userModel.js';
import ClassCards from '../models/classCardsModel.js';

export const getStudyset = (req, res) => {
  const { id, studySetId } = req.query;
  Classrooms.findById(id).exec((err, classObj) => {
    if (err || !classObj) {
      return res.status(404).json({
        message: 'Class not found',
      });
    } else {
      if (!classObj.studysets) {
        return res.status(404).json({
          message: 'No study sets found',
        });
      } else {
        const studySet = classObj.studysets.filter(
          (studySet) => studySet._id.toString() === studySetId
        )[0];
        return res.status(200).json({
          studySet,
        });
      }
    }
  });
};

export const getHub = (req, res) => {
  res.render('pages/hub', {
    layout: 'layouts/hubLayout',
    data: {
      elements: [],
      title: 'Kimm Hub',
    },
    page: 'main',
  });
};

export const getToDo = (req, res) => {
  res.render('pages/hub/todoList', {
    layout: 'layouts/hubLayout',
    data: {
      elements: [
        { type: 'css', path: '/css/todoList.css' },
        { type: 'js', path: '/js/todoList.js' },
      ],
      title: 'Kimm - Todo List',
    },
  });
};

export const getCalendar = (req, res) => {
  res.render('pages/hub/calendar', {
    layout: 'layouts/hubLayout',
    data: {
      elements: [
        { type: 'css', path: '/css/calendar.css' },
        { type: 'js', path: '/js/calendar.js' },
      ],
      title: 'Kimm - Calendar',
    },
    default: false,
  });
};

export const getClasses = (req, res) => {
  Classrooms.find(
    {
      $or: [{ classTeacher: req.user.id }, { classStudents: req.user.id }],
    },
    async (err, classes) => {
      if (err) {
        req.flash('error', 'Error loading classes');
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
      res.render('pages/classMenu', {
        layout: 'layouts/hubLayout',
        data: {
          elements: [{ type: 'css', path: '/css/classMenu.css' }],
          title: 'Kimm - Classes',
        },
        classes: trueClass,
      });
    }
  );
};

export const getAddClass = (req, res) => {
  res.render('pages/addClass', {
    layout: 'layouts/hubLayout',
    data: {
      elements: [],
      title: 'Add a Class - Kimm',
    },
    page: 'addClass',
  });
};

export const postAddClass = async (req, res) => {
  const { name, description, image, students } = req.body;
  if (!(name && description && image && students))
    return res.redirect('/hub/add');
  let studentsArray = students.toLowerCase().split(' '),
    studentsIds = [],
    notFound = [];
  for (let i = 0; i < studentsArray.length; i++) {
    let student = await User.findOne({ email: studentsArray[i] });
    if (student) studentsIds.push(student._id);
    else notFound.push(studentsArray[i]);
  }

  try {
    let classObj = new Classrooms({
      name,
      description,
      image,
      students: studentsIds,
      classTeacher: req.user.id,
    });
    await classObj.save();
    req.flash(
      'success',
      `The following emails were not found: ${notFound.join(' ')}`
    );
    res.redirect('/hub');
  } catch (err) {
    req.flash('error', 'Error adding class');
    res.redirect('/hub/add');
  }
};

export const getClassId = (req, res) => {
  const { id } = req.params;
  Classrooms.findById(id).exec((err, classObj) => {
    if (err || !classObj) {
      req.flash('error', 'Class not found');
      return res.redirect('/hub');
    }
    ClassCards.findByClassId(id).exec((err, cards) => {
      if (err) {
        req.flash('success', 'No post found');
        return;
      }

      res.render('pages/class', {
        layout: 'layouts/hubLayout',
        data: {
          elements: [
            { type: 'css', path: '/css/class.css' },
            { type: 'js', path: '/js/classFunctions.js' },
            { type: 'js', path: '/js/display.js' },
          ],
          title: `${classObj.name} - Kimm`,
        },
        page: 'class',
        classroom: classObj,
        cards,
        id: req.params.id,
      });
    });
  });
};

export const deleteClass = async (req, res) => {
  const { id } = req.params;
  // Find class owner
  try {
    let classObj = await Classrooms.findById(id);
    if (classObj.classTeacher.toString() === req.user.id) {
      await Classrooms.findByIdAndDelete(id);
      // Flash success message
      req.flash('success', 'Class deleted');
      res.redirect('/hub');
    } else {
      res.redirect('/hub');
    }
  } catch (err) {
    req.flash('success', err.message);
    res.redirect('/hub');
  }
};

export const getPost = (req, res) => {
  res.render('pages/classPost', {
    layout: 'layouts/hubLayout',
    data: {
      elements: [],
      title: 'Class Post - Kimm',
    },
    page: 'classPost',
    id: req.params.id,
  });
};

export const createPost = (req, res) => {
  const { id } = req.params;
  const { title, description, media, cardText: text } = req.body;
  if (!(title && description && text))
    return res.redirect(`/hub/class/id/${id}/post`);
  else {
    const newCard = new ClassCards({
      classId: id,
      cardType: 'post',
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
        req.flash('error', 'Error adding post');
        return res.redirect(`/hub/class/id/${id}`);
      } else {
        res.redirect(`/hub/class/id/${id}`);
      }
    });
  }
};

// TODO: Feedback
export const postFeedback = (req, res) => {
  const { id } = req.params;
  console.log(req.body);
  req.flash('success', 'Feedback submitted, value: ' + req.body.res);
  res.redirect(`/hub/class/id/${id}`);
};

export const getStudysetByClass = (req, res) => {
  const { id } = req.params;
  let studySets = [];
  Classrooms.findById(id).exec((err, classObj) => {
    if (err || !classObj) {
      req.flash('error', 'Class not found');
      return res.redirect('/hub');
    }
    if (!classObj.studysets) {
      studySets = false;
      return;
    }
    studySets = classObj.studysets;
    res.render('pages/manageSets', {
      layout: 'layouts/hubLayout',
      data: {
        elements: [
          { type: 'css', path: '/css/studySet.css' },
          { type: 'js', path: '/js/flashcards.js' },
          { type: 'js', path: '/js/display.js' },
        ],
        title: 'Study Set - Kimm',
      },
      studysets: studySets,
      page: 'studySet',
      id: req.params.id,
      author: req.user.id,
    });
  });
};

export const postStudysetByClass = (req, res) => {
  const { id } = req.params;
  const { name, description, flashcard: flashcards } = req.body;

  // #region Validation

  if (!(name && description && flashcards)) {
    req.flash('error', 'Please fill in all fields');
    return res.redirect(`/hub/class/id/${id}/study-sets`);
  }

  flashcards.forEach((flashcard) => {
    if (!flashcard.term || !flashcard.definition || !flashcard.author) {
      req.flash('error', 'Please fill in all the flashcard fields');
      return res.redirect(`/hub/class/id/${id}/study-sets`);
    }

    if (flashcard.interchangeable) {
      flashcard.interchangeable = true;
    }
  });

  // #endregion

  Classrooms.findById(id).exec((err, classObj) => {
    if (err || !classObj) {
      req.flash('error', 'Class not found');
      return res.redirect('/hub');
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
        req.flash('error', 'Error adding study set');
        return res.redirect(`/hub/class/id/${id}/study-sets`);
      } else {
        req.flash('success', 'Study set added');
        return res.redirect(`/hub/class/id/${id}/study-sets`);
      }
    });
  });
};

export const displayStudyset = (req, res) => {
  res.render('pages/studySet', {
    layout: 'layouts/hubLayout',
    data: {
      elements: [
        { type: 'css', path: '/css/studySet.css' },
        { type: 'js', path: '/js/studyset.js' },
      ],
      title: 'Study Set - Kimm',
    },
    page: 'studySet',
  });
};
export default router;
