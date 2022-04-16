if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express"),
  app = express(),
  mongoose = require("mongoose"),
  session = require("express-session"),
  MongoStore = require("connect-mongo"),
  helmet = require("helmet");

mongoose.connect(process.env.DATABASE_URI, { useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.info("Connected to Mongoose"));

// Security
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DATABASE_URI }),
  })
);
app.use(helmet({ contentSecurityPolicy: false }));
app.disable("x-powered-by");

const expressLayouts = require("express-ejs-layouts"),
  path = require("path"),
  bodyParser = require("body-parser"),
  multer = require("multer"),
  passport = require("passport"),
  flash = require("express-flash"),
  methodOverride = require("method-override");

const upload = multer(),
  initializePassport = require("./middleware/passport-config"),
  indexRouter = require("./routes/index"),
  hubRouter = require("./routes/hub"),
  User = require("./models/user");

initializePassport(passport, (email) =>
  User.findOne({ email: email }).then((user) => {
    return user;
  })
);

// Setup view engine, middleware, and routes
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("layout", "layouts/layout");
app.use(expressLayouts);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(upload.array());
app.use(express.static(path.join(__dirname, "public")));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));
app.use(function (req, res, next) {
  res.locals.login = req.isAuthenticated();
  next();
});

app.use("/", indexRouter);
app.use("/hub", hubRouter);

app.all("*", (req, res) => {
  res.status(404).send("404 Not Found");
});

app.listen(process.env.PORT || 3000);
