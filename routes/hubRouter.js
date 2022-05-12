import express from 'express';
import { getCalendar, getClasses, getHub, getToDo } from '../controllers/class.js';
import { checkAuthenticated } from '../middleware/checkAuth.js';
import classRoute from './classRouter.js';
const router = express.Router();

router.use(checkAuthenticated);

router.get('/', getHub);

router.get('/:id/classes', getClasses);

router.get('/:id/todo', getToDo);

router.get('/:id/calendar', getCalendar);

router.use('/class', classRoute);

export default router;
