var createError = require("http-errors");
var express = require("express");
var dotenv = require("dotenv").config();
var path = require("path");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var logger = require("morgan");
const jwt = require("jsonwebtoken");
const validateToken = require("./middleware/validateTokenHandler");

//initialise router
var blogRouter = require("./routes/blog");
var authRouter = require("./routes/auth");
var app = express();
const port = process.env.PORT || 5001;

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

//Check if the user is logged in or not
// Routes\
//login a user
// app.use("*", (req, res) => {
//   // Check if user is authenticated
//   const token = req.cookies["auth-token"];
//   if (!token) {
//     res.redirect("/authentication/login");
//   } else {
//     // Verify token and render home page
//     jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
//       if (err) {
//         res.redirect("/authentication/login");
//       } else {
//         res.render("/main", { user: decoded });
//       }
//     });
//   }
// });
const isAuthenticated = function (req, res, next) {
  const token = req.cookies.authentication_status;
  if (!token) {
    // Redirect to login page if no token is found
    console.log("inside authenticated func no token found");
    return res.redirect("/authentication/login");
  }

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECERT);
    req.user = decoded;
    return res.redirect("/main");
    // next();
  } catch (err) {
    console.error(err);
    // Redirect to login page if token is invalid
    return res.redirect("/authentication/login");
  }
};

app.use("/authentication", authRouter);
app.use("/", validateToken, blogRouter);
app.use("/", isAuthenticated);

// app.use("/", registerRouter);
// app.use("/Comment", commentRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  //set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render("error");
});
// Starting Server
app.listen(port, (err, res) => {
  if (err) {
    console.error(`Error Occured while starting server! ${err}`);
  } else {
    console.log(`Server Started at Port ${port}...`);
  }
});
