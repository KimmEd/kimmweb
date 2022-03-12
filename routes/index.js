const express = require('express'),
	router = express.Router(),
	bcrypt = require('bcrypt'),
	User = require('../models/user'),
	passport = require('passport');

const { checkNotAuthenticated, checkAuthenticated } = require('../checkAuth');

router.get('/', (req, res) => {
	res.render('pages/index');
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
		console.error(err.message);
		res.redirect('/register');
	}
});

router.get('/play', checkAuthenticated, (req, res) => {
	// res.render('pages/play');
	console.log(__dirname);
	res.set('Content-Encoding: br');
	res.sendFile('C:\\Users\\PcFull\\Documents\\GitHub\\kimmweb\\test\\index.html')
	// res.sendFile(__dirname + '/public/play.html');
})
router.delete('/logout', checkAuthenticated, (req, res) => {
	req.logOut();
	res.redirect('/login');
});

module.exports = router;
