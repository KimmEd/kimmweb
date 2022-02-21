// if (process.env.NODE_ENV !== "production") {
//   require("dotenv").config();
// }
const express = require("express"),
  app = express(),
  expressLayouts = require("express-ejs-layouts"),
  path = require("path"),
  bodyParser = require("body-parser"),
  multer = require("multer"),
  upload = multer(),
  logger = require("./logger"),
  indexRouter = require("./routes/index");

// Setup view engine, middleware, and routes
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("layout", "layouts/layout");
app.use(expressLayouts);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(upload.array());
app.use(express.static(path.join(__dirname, "public")));

app.use('/', indexRouter);

app.all("*", (req, res) => {
  res.status(404).send("404 Not Found");
});

app.listen(5000, () => {
  logger.info("Server is running on http://localhost:5000");
});
