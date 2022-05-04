import dotenv from "dotenv";
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import MongoStore from "connect-mongo";
import helmet from "helmet";
import expressEjsLayouts from "express-ejs-layouts";
import path from "path";
import bodyParser from "body-parser";
import flash from "express-flash";
import passport from "passport";
import methodOverride from "method-override";
import multer from "multer";
const app = express();

import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url),
  __dirname = dirname(__filename);

mongoose.connect(process.env.DATABASE_URI, { useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.info("Connected to Mongoose"));

// Security
// Session lasts 14 days.
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

const upload = multer();
import initializePassport from "./middleware/passport-config.js";
import indexRouter from "./routes/indexRouter.js";
import hubRouter from "./routes/hubRouter.js";
import apiRouter from "./routes/apiRouter.js";
import User from "./models/userModel.js";

initializePassport(passport, (email) =>
  User.findOne({ email: email }).then((user) => {
    return user;
  })
);

// Setup view engine, middleware, and routes
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("layout", "layouts/layout");
app.use(expressEjsLayouts);
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
app.use("/api", apiRouter);

app.all("*", (req, res) => {
  res.status(404).render("pages/404", {layout: "layouts/basicLayout"});
});

app.listen(process.env.PORT || 3000);
