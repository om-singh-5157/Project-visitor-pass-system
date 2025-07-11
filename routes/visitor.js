const express = require("express");
const router = express.Router();
const visitorController = require("../controllers/visitor.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, validateVisitor } = require("../middleware.js");

//Show the form
router.get("/new", isLoggedIn, wrapAsync(visitorController.renderNewForm));

//Show the dashboard
router.get(
  "/:id/dashboard",
  isLoggedIn,
  wrapAsync(visitorController.userDashboard)
);

//Show the history
router.get(
  "/:id/history",
  isLoggedIn,
  wrapAsync(visitorController.viewHistory)
);

//Submit form
router.post(
  "/",
  isLoggedIn,
  validateVisitor,
  wrapAsync(visitorController.createVisitor)
);

module.exports = router;
