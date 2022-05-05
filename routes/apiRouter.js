import express from 'express';
const router = express.Router();

import { getStudyset } from '../controllers/class.js';

router.get('/studyset', getStudyset);
// TODO: Work on post studyset to submit scores.

export default router;
