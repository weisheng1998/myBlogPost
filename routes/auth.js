var express = require("express");
var router = express.Router();
const jwt = require("jsonwebtoken");
const { auth } = require("../config/firebaseConfig");
const authetication = require("firebase/auth");

//@desc Render User Login Page
//@route GET /authentication/login
//@access public
router.get("/login", function (req, res, next) {
  const token = req.cookies.authentication_status;
  if (token) {
    return res.redirect("/main");
  }
  return res.render("login");
  //fucntion to login the user
});
//@desc Render User Signup Page
//@route GET /authentication/register
//@access public
router.get("/register", function (req, res, next) {
  const token = req.cookies.authentication_status;
  if (token) {
    return res.redirect("/main");
  }
  return res.render("register");
});

//@desc Log the user out and redirect to login page
//@route GET /authentication/logout
//@access private
router.get("/logout", function (req, res, next) {
  authetication
    .signOut(auth)
    .then(() => {
      // clear the cookie
      res.clearCookie("authentication_status");
      // redirect the user to the login page
      res.redirect("/authentication/login");
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error logging out");
    });
});

//@desc Submit User Registration Form, Login and Redirect to Main Page
//@route POST /authentication/register
//@access public
router.post("/register", function (req, res, next) {
  try {
    let { email, password } = req.body;
    authetication
      .createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        var user = userCredential.user.email;
        const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECERT);
        console.log(user);
        console.log("done register and login");
        res.cookie("authentication_status", accessToken, { maxAge: 900000 });
        return res.redirect("/main");
      })
      .catch((error) => {
        res.locals.message = error.message;
        res.locals.error = req.app.get("env") === "development" ? error : {};
        // render the error page
        res.status(error.status || 500);
        res.render("error");
      });
  } catch (e) {
    res.redirect("/authentication/register");
  }
});

///@desc Submit User Login Form, Login and Redirect to Main Page
//@route POST /authentication/login
//@access public
router.post("/login", function (req, res, next) {
  try {
    let { email, password } = req.body;
    authetication
      .signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        var user = userCredential.user.email;

        const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECERT);
        console.log(user);
        console.log("done login");
        res.cookie("authentication_status", accessToken, { maxAge: 900000 });
        return res.redirect("/main");
      })
      .catch((error) => {
        res.locals.message = error.message;
        res.locals.error = req.app.get("env") === "development" ? error : {};
        // render the error page
        res.status(error.status || 500);
        res.render("error");
        // res.redirect("/authentication/login");
      });
  } catch (e) {
    console.log("failed");
    res.redirect("/authentication/login");
  }
});

module.exports = router;
