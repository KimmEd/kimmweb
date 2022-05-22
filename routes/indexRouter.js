import { Router } from 'express';
import {
  checkAuthenticated,
  checkNotAuthenticated,
} from '../middleware/checkAuth.js';

const router = Router();

import {
  getHome,
  getAbout,
  getLogin,
  postLogin,
  getContact,
  postContact,
  getRegister,
  postRegister,
  deleteLogin,
  getGame,
} from '../controllers/index.js';

router.get('/', getHome);

router.get('/about', getAbout);

router
  .route('/login')
  .get(checkNotAuthenticated, getLogin)
  .post(checkNotAuthenticated, postLogin)
  .delete(checkAuthenticated, deleteLogin);

router.route('/contact').get(getContact).post(postContact);

router
  .route('/register')
  .get(checkNotAuthenticated, getRegister)
  .post(checkNotAuthenticated, postRegister);

router.get('/game', getGame)

export default router;
