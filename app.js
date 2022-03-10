if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}
const express = require('express'),
	app = express(),
	expressLayouts = require('express-ejs-layouts'),
	path = require('path'),
	bodyParser = require('body-parser'),
	multer = require('multer'),
	passport = require('passport'),
	flash = require('express-flash'),
	session = require('express-session'),
	methodOverride = require('method-override');

const upload = multer(),
	initializePassport = require('./passport-config'),
	indexRouter = require('./routes/index'),
	hubRouter = require('./routes/hub'),
	User = require('./models/user');

initializePassport(passport, (email) =>
	User.findOne({ email: email }).then((user) => {
		return user;
	})
);

// Setup view engine, middleware, and routes
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layouts/layout');
app.use(expressLayouts);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(upload.array());
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());
app.use(
	session({
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
	})
);
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));
app.use(function (req, res, next) {
	res.locals.login = req.isAuthenticated();
	next();
});

const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URI, { useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.info('Connected to Mongoose'));

app.use('/', indexRouter);
app.use('/hub', hubRouter);

app.all('*', (req, res) => {
	res.status(404).send('404 Not Found');
});

app.listen(process.env.PORT || 3000);
