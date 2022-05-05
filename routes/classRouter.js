import express from 'express';
const   router = express.Router();

import { getAddClass, postAddClass, getClassId, deleteClass, getPost, createPost, postFeedback, getStudysetByClass, postStudysetByClass, displayStudyset } from '../controllers/class.js';
router.get('/', (req, res) => {
  res.redirect('/hub');
});

// TODO: Just upload and save the file to the database instead of using fucking url.
router
  .route('/add')
  .get(getAddClass)
  .post(postAddClass);

router
  .route('/id/:id')
  .get(getClassId)
  .delete(deleteClass);

router
  .route('/id/:id/post')
  .get(getPost)
  .post(createPost);

router.post('/id/:id/feedback', postFeedback);

router
  .route('/id/:id/study-sets')
  .get(getStudysetByClass)
  .post(postStudysetByClass);

router.route('/id/:id/study-sets/:studySetId').get(displayStudyset);
// Submit study set scores
// .post((req, res) => {})

// TODO: Add a route to leave class
export default router;
