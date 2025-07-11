const { visitorSchema } = require("./schema.js");
const ExpressError = require("./utils/ExpressError.js");

module.exports.validateVisitor = (req, res, next) => {
  const { error } = visitorSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400, msg);
  } else {
    next();
  }
};

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash("error", "You must be signed in first!");
    return res.redirect("/login");
  }
  next();
};

module.exports.isApprover = (req, res, next) => {
  if (!req.user || req.user.role !== "approver") {
    req.flash("error", "Approver access required.");
    return res.redirect("/login");
  }
  next();
};

module.exports.isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === 'admin') {
    return next();
  }
  req.flash("error", "Admin access required");
  res.redirect("/login");
};