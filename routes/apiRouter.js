import express from 'express';
import {
    deleteTodoAPI,
    getClassAPI,
    getStudysetAPI,
    getTodoAPI,
    patchTodoAPI,
    postStudysetScoreAPI,
    postTodoAPI
} from '../controllers/class.js';
const router = express.Router();

// Version 1 of the API
router
    .route('/v1/user/:uid/studyset/:sid/study')
    .get(getStudysetAPI)
    // TODO: Work on post studyset to submit scores.
    .post(postStudysetScoreAPI);
// TODO: Work on get todo to get todo list.
router.route('/v1/user/:id/todo').get(getTodoAPI).post(postTodoAPI).patch(patchTodoAPI).delete(deleteTodoAPI);

router.get('/v1/class', getClassAPI);

router.get('/v1/studyset/score', postStudysetScoreAPI);

export default router;
