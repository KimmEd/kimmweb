if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}
const express = require('express'),
	app = express(),
	expressLayouts = require('express-ejs-layouts'),
	path = require('path'),
	bodyParser = require('body-parser'),
	multer = require('multer'),
	upload = multer(),
	indexRouter = require('./routes/index'),
	cultureRouter = require('./routes/cultures'),
	accountRouter = require('./routes/account'),
	logger = require('./logger');

// Setup view engine, middleware, and routes
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layouts/layout');
app.use(expressLayouts);
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(upload.array());
app.use(express.static(path.join(__dirname, 'public')));