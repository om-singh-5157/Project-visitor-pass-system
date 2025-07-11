const express = require("express");
const router = express.Router();
const approverController = require("../controllers/approver.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isApprover } = require("../middleware.js");

//Admin dashboard
router.get(
  "/:id/dashboard",
  isLoggedIn,
  isApprover,
  wrapAsync(approverController.renderDashboard)
);

//Approve visitor
router.post(
  "/:id/approve",
  isLoggedIn,
  isApprover,
  wrapAsync(approverController.approveVisitor)
);

router.post(
  "/:id/reject",
  isLoggedIn,
  isApprover,
  wrapAsync(approverController.rejectVisitor)
);

module.exports = router;
