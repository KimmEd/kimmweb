import express from 'express';
const router = express.Router();

import { checkAuthenticated } from '../middleware/checkAuth.js';
import { getHub, getToDo, getCalendar, getClasses } from '../controllers/class.js';
router.use(checkAuthenticated);

router.get('/', getHub);

router.get('/classes', getClasses);

router.get('/todo', getToDo);

router.get('/calendar', getCalendar);

import classRoute from './classRouter.js';
router.use('/class', classRoute);

export default router;
