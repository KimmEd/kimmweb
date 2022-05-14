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
    .route('/v1/user/:userId/studyset/:setId/study')
    .get(getStudysetAPI)
    // TODO: Work on post studyset to submit scores.
    .post(postStudysetScoreAPI);
router.route('/v1/user/:id/todo').get(getTodoAPI).post(postTodoAPI).patch(patchTodoAPI).delete(deleteTodoAPI);

router.get('/v1/class', getClassAPI);

export default router;
