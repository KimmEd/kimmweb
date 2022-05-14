import express from 'express';
import mongoose from 'mongoose';
import ClassCards from '../models/classCardsModel.js';
import Classrooms from '../models/classModel.js';
import User from '../models/userModel.js';

const router = express.Router();

export const getStudysetAPI = (req, res) => {
    const { userId, setId } = req.params;
    Classrooms.findById(userId).exec((err, classObj) => {
        if (err || !classObj) {
            return res.status(404).json({
                message: 'Class not found',
                error: err || 'Class not found',
            });
        } else {
            if (!classObj.studysets) {
                return res.status(404).json({
                    message: 'No study sets found',
                });
            } else {
                const studySet = classObj.studysets.filter(
                    (studySet) => studySet._id.toString() === setId,
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
        id: req.user.id,
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
        id: req.user.id,
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
        id: req.user.id,
    });
};

export const getClasses = (req, res) => {
    User.findById(req.user._id).exec((err, user) => {
        if (err || !user) {
            return res.status(404).redirect('/404');
        } else {
            if (!user.classes) {
                req.flash('error', 'No classes found');
                return res.redirect('/hub');
            }
            Classrooms.find({ _id: { $in: user.classes } }).exec(
                (err, classes) => {
                    if (err || !classes) {
                        return res.status(404).redirect('/404');
                    } else {
                        return res.render('pages/hub/classMenu', {
                            layout: 'layouts/hubLayout',
                            data: {
                                elements: [
                                    { type: 'css', path: '/css/classMenu.css' },
                                ],
                                title: 'Kimm - Classes',
                            },
                            classes,
                            id: req.user.id,
                        });
                    }
                },
            );
        }
    });
    // Classrooms.find(
    //     {
    //         $or: [
    //             { classTeacher: req.user.id },
    //             { classStudents: req.user.id },
    //         ],
    //     },
    //     async (err, classes) => {
    //         if (err) {
    //             req.flash('error', 'Error loading classes');
    //             return;
    //         }
    //         const trueClass = await Promise.all(
    //             classes.map(async (classroom) => {
    //                 return {
    //                     owner: await User.findById(classroom.classTeacher),
    //                     ...classroom._doc,
    //                 };
    //             }),
    //         );
    //         res.render('pages/classMenu', {
    //             layout: 'layouts/hubLayout',
    //             data: {
    //                 elements: [{ type: 'css', path: '/css/classMenu.css' }],
    //                 title: 'Kimm - Classes',
    //             },
    //             classes: trueClass,
    //         });
    //     },
    // );
};

export const getAddClass = (req, res) => {
    res.render('pages/addClass', {
        layout: 'layouts/hubLayout',
        data: {
            elements: [],
            title: 'Add a Class - Kimm',
        },
        page: 'addClass',
        id: req.user.id,
    });
};

export const postAddClass = async (req, res) => {
    const { name, description, image, students } = req.body;
    if (!(name && description && students)) return res.redirect('/hub/add');
    let studentsArray = students.toLowerCase().split(' '),
        studentsIds = [],
        notFound = [];
    try {
        for (let i = 0; i < studentsArray.length; i++) {
            let student = await User.findOne({ email: studentsArray[i] });
            if (student) studentsIds.push(student._id);
            else throw student;
        }
    } catch (error) {
        notFound.push(error);
    }

    try {
        let classObj = new Classrooms({
            name,
            description,
            image: image || null,
            students: studentsIds,
            classTeacher: req.user.id,
        });
        await classObj.save();
        studentsIds.push(req.user.id);
        studentsIds.forEach(async (student) => {
            await User.findById(student).then(async (user) => {
                user.addClass = classObj._id;
                await user.save();
            });
        });

        req.flash(
            'success',
            `The following emails were not found: ${notFound.join(' ')}`,
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
    if (!(title && description && text)) {
        req.flash('error', 'Please fill in all fields');
        return res.redirect(`/hub/class/id/${id}/post`);
    } else {
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
                req.flash('success', 'Post added');
                res.redirect(`/hub/class/id/${id}`);
            }
        });
    }
};

export const postFeedback = (req, res) => {
    const { id } = req.params;
    /** Get feedback with target.objectType, target.objectId, score & author */
    const { feedback } = req.body;
    if (!feedback) {
        req.flash('error', 'No feedback provided');
        return res.redirect(`/hub/class/id/${id}`);
    }
    let score = parseInt(feedback);
    if (isNaN(score) || score < 0 || score > 5) {
        req.flash('error', 'Invalid score');
        return res.redirect(`/hub/class/id/${id}`);
    }

    Classrooms.findById(id).exec((err, classroom) => {
        if (err || !classroom) {
            req.flash('error', 'Class not found');
            return res.redirect('/hub');
        }
        if (
            classroom.classFeedback.some(
                (feedback) => feedback.author.toString() === req.user.id,
            )
        ) {
            req.flash('error', 'You have already submitted feedback');
            return res.redirect(`/hub/class/id/${id}`);
        }

        classroom.classFeedback.push({
            feedbackType: 'classroom',
            targetId: id,
            score: Math.min(score * 25, 100),
            author: req.user.id,
        });
        classroom.save((err) => {
            if (err) {
                console.log(err);
                req.flash('error', 'Error adding feedback');
            } else req.flash('success', 'Feedback added');

            res.redirect(`/hub/class/id/${id}`);
        });
    });
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
        id: req.user.id,
    });
};

export const postStudysetScoreAPI = (req, res) => {
    const { userId, setId } = req.params;
    const { flashcardScore } = req.body;
    if (
        !mongoose.Types.ObjectId.isValid(userId) ||
        !mongoose.Types.ObjectId.isValid(setId)
    )
        return res.status(404).json({ message: 'User or study set id is not valid' });
    User.findById(userId).exec((err, user) => {
        if (err || !user)
            return res.status(404).json({ message: 'User not found', error: err, user: user });
        user.flashcardProgress = flashcardScore;
        user.save((err) => {
            if (err)
                return res
                    .status(500)
                    .json({ message: 'Error saving score', error: err });
            return res.status(200).json({ message: 'Score saved' });
        });
    });
};

export const getTodoAPI = (req, res) => {
    User.findById(req.user.id).exec((err, user) => {
        if (err || !user)
            return res.status(404).json({
                error: 'User not found',
            });

        res.json(user.todo);
    });
};

export const postTodoAPI = (req, res) => {
    const { todo } = req.body;
    if (todo.length == 0)
        return res.status(400).json({ error: 'No todo provided' });
    if (todo.some(t => t.taskName.length < 5)) 
        return res.status(400).json({ error: 'Todo must be at least 5 characters long' });
    User.findById(req.user.id).exec(async (err, user) => {
        if (err || !user)
            return res.status(404).json({ error: 'User not found' });
        user.todo = todo;
        await user.save((err) => {
            if (err)
                return res
                    .status(500)
                    .json({ display: 'Error saving todo', error: err.message });
            res.json({ success: true });
        });
    });
};

export const deleteTodoAPI = (req, res) => {
    const { todoId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(todoId))
        return res.status(400).json({ error: 'Invalid todo id' });
    User.findById(req.user.id).exec(async (err, user) => {
        if (err || !user)
            return res.status(404).json({ error: 'User not found' });
        user.progress.todo.id(todoId).remove();
        await user.save((err) => {
            if (err)
                return res
                    .status(500)
                    .json({ error: 'Error deleting todo', ext: err.message });
            res.json({ success: true });
        });
    });
}

/**
 *
 * @param {*} req - request object
 * @param { todoSchema } req.body.todo - todo object
 * @param { String } req.body.action - action to perform ['STATUS', 'EDIT']
 * @param {*} res - response object
 * @returns { JSON } - response object
 */
export const patchTodoAPI = (req, res) => {
    const { todo, action } = req.body;
    if (!todo) return res.status(400).json({ error: 'No todo provided' });
    if (!action) return res.status(400).json({ error: 'No action provided' });
    User.findById(req.user.id).exec((err, user) => {
        if (err || !user)
            return res.status(404).json({ error: 'User not found' });
        user.progress.todo.id(todo._id).exec((err, todoObject) => {
            if (err || !todoObject)
                return res.status(404).json({ error: 'Todo not found' });
            switch (action) {
                case 'STATUS':
                    todoObject.status = todo.status;
                    break;
                case 'EDIT':
                    todoObject.edit = todo;
                    break;
                default:
                    return res.status(400).json({ error: 'Invalid action' });
            }
        });
        user.save((err) => {
            if (err)
                return res
                    .status(500)
                    .json({ display: 'Error saving todo', error: err.message });
            res.json({ success: true });
        });
    });
};

export const getClassAPI = (req, res) => {
    Classrooms.findById(req.query.class).exec((err, classObj) => {
        console.log(classObj);
        res.send(classObj);
    });
};

export default router;
