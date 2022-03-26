const express = require('express'),
	router = express.Router(),
	bcrypt = require('bcrypt'),
	User = require('../models/user'),
	passport = require('passport');

const { checkNotAuthenticated, checkAuthenticated } = require('../checkAuth');

router.get('/', (req, res) => {
	res.render('pages/index', );
});

router.get('/login', checkNotAuthenticated, (req, res) => {
	res.render('pages/login');
});

router.post(
	'/login',
	checkNotAuthenticated,
	passport.authenticate('local', {
		successRedirect: '/hub',
		failureRedirect: '/login',
		failureFlash: true,
	})
);

router.get('/register', checkNotAuthenticated, (req, res) => {
	res.render('pages/register');
});

router.post('/register', checkNotAuthenticated, async (req, res) => {
	try {
		const hashedPassword = await bcrypt.hash(req.body.password, 10);
		let user = new User();
		user.email = req.body.email;
		user.password = hashedPassword;
		user.username = req.body.username;
		await user.save();
		res.redirect('/login');
	} catch (err) {
		req.flash('error', err.message);
		res.redirect('/register');
	}
});

router.delete('/logout', checkAuthenticated, (req, res) => {
	req.logOut();
	res.redirect('/login');
});

module.exports = router;
