const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");
const wrapAsync = require("../utils/wrapAsync");

//Render registration form
router.get("/register", (req, res) => {
  const role = req.query.role || "user";
  res.render("users/register", { role });
});

//Handle registration
router.post(
  "/register",
  wrapAsync(async (req, res, next) => {
    try {
      const { username, password, email, role } = req.body;
      const user = new User({
        username,
        email,
        role: Array.isArray(role) ? role[0] : role,
      });
      const registeredUser = await User.register(user, password);
      req.login(registeredUser, (err) => {
        if (err) {
          console.log("Login error:", err);
          return next(err);
        }
        console.log("User role after registration:", registeredUser.role);
        if (registeredUser.role === "approver") {
          return res.redirect(`/approver/${registeredUser._id}/dashboard`);
        } else {
          return res.redirect(`/visitor/${registeredUser._id}/dashboard`);
        }
      });
    } catch (e) {
      req.flash("error", e.message);
      res.redirect("/register");
    }
  })
);

//Render login form
router.get("/login", (req, res) => {
  res.render("users/login");
});

//Handle login
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      req.flash("error", "Invalid username or password");
      return res.redirect("/login");
    }
    req.logIn(user, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome back!");

      //role-based
      if (user.role === "admin") {
      return res.redirect("/admin/dashboard");}
      if (user.role === "approver") {
        return res.redirect(`/approver/${user._id}/dashboard`);
      }
      return res.redirect(`/visitor/${user._id}/dashboard`);
    });
  })(req, res, next);
});

//Logout
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "Goodbye!");
    res.redirect("/");
  });
});

module.exports = router;
