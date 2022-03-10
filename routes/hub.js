const express = require('express'),
	router = express.Router(),
	expressLayouts = require('express-ejs-layouts');

const { checkAuthenticated } = require('../checkAuth');
router.use(expressLayouts);
router.use(checkAuthenticated);

router.get('/', (req, res) => {
	res.render('pages/hub', {
		layout: 'layouts/hubLayout',
		data: {
			elements: [{ type: 'css', path: 'css/sidebar.css' }],
			title: 'Kimm',
		},
		page: 'main',
	});
});

router.get('/classes', (req, res) => {
	const classesInfo = require('../resources/classes.json'),
		classes = Object.values(classesInfo);
	res.render('pages/classMenu', {
		layout: 'layouts/hubLayout.ejs',
		data: {
			elements: [{ type: 'css', path: '/css/sidebar.css' }, { type: 'css', path: '/css/classes.css'}],
			title: 'Kimm - Classes',
		},
		page: 'classes',
		classes
	});
});

router.use('/class', require('./class'));



module.exports = router;
