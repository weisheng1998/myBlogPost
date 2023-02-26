const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const { authentication_status } = req.cookies;
  if (!authentication_status) {
    console.log("no token available in cookies");
    res.status(401);
    return res.redirect("/authentication/login");
  }
  jwt.verify(
    authentication_status,
    process.env.ACCESS_TOKEN_SECERT,
    (err, decoded) => {
      if (err) {
        console.log("error found while validating token");
        res.status(401);
        // throw new Error("User is not authorized");
        return res.redirect("/authentication/login");
      }
      req.user = decoded;
      console.log(`user is authorised ${req.user}`);
      next();
    }
  );
};
