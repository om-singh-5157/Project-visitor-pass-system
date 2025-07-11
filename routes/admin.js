const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Visitor = require("../models/visitor");
const { isLoggedIn, isAdmin } = require("../middleware");

// Admin Dashboard
router.get("/dashboard", isLoggedIn, isAdmin, (req, res) => {
  res.render("admin/dashboard"); // shows Approver/User buttons
});

// List of all Approvers
router.get("/approvers", isLoggedIn, isAdmin, async (req, res) => {
  const approvers = await User.find({ role: "approver" });
  res.render("admin/approvers", { approvers });
});

// Approver's visitor history
router.get("/approvers/:id", isLoggedIn, isAdmin, async (req, res) => {
  const approver = await User.findById(req.params.id);
  const visitors = await Visitor.find({ approver: approver._id });
  res.render("admin/approverHistory", { approver, visitors });
});

// List of all Users
router.get("/users", isLoggedIn, isAdmin, async (req, res) => {
  const users = await User.find({ role: "user" });
  res.render("admin/users", { users });
});

// User's visitor submissions
router.get("/users/:id", isLoggedIn, isAdmin, async (req, res) => {
  const user = await User.findById(req.params.id);
  const visitors = await Visitor.find({ createdBy: user._id });
  res.render("admin/userHistory", { user, visitors });
});

module.exports = router;
