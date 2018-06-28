const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const session = require("express-session");
const crypto = require("crypto");
const MongoDBStore = require("connect-mongodb-session")(session);

const { HOST = "localhost", PORT = 27017 } = process.env;

mongoose.connect(
  `mongodb://${HOST}:${PORT}/facebook`,
  function(error) {
    if (!error) {
      console.log("Successfully connected to monogoDb");
    }
  }
);

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

/** setup sessions */
app.use(
  session({
    secret: crypto.randomBytes(32).toString("hex"),
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      maxAge: 60 * 24 * 7 * 60 * 1000,
    },
    store: new MongoDBStore({
      uri: `mongodb://${HOST}:${PORT}/facebook`,
      collection: "sessions",
    }),
  })
);

app.use("/", indexRouter);
app.use("/users", usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
