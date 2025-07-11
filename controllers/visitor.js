const Visitor = require("../models/visitor.js");
const User = require("../models/user");
const transporter = require("../utils/mailer");

module.exports.renderNewForm = async (req, res) => {
  if (req.user.role === "approver") {
    req.flash("error", "Approvers cannot register visitors.");
    return res.redirect(`/approver/${req.user._id}/dashboard`);
  }

  const approvers = await User.find({ role: "approver" });
  res.render("visitor/new", {
    approvers,
    userId: req.user._id,
    showBackButton: true,
  });
};

module.exports.createVisitor = async (req, res) => {
  const data = req.body.visitor;

  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  const diffDays = (endDate - startDate) / (1000 * 60 * 60 * 24);

  if (diffDays < 0 || diffDays > 3) {
    req.flash("error", "End date must be within 3 days from start date.");
    return res.redirect("/visitor/new");
  }

  const visitor = new Visitor(data);
  visitor.createdBy = req.user._id;
  await visitor.save();

  const approver = await User.findById(visitor.approver);
  const creator = await User.findById(req.user._id);

  //Send email to visitor
  await transporter.sendMail({
    to: visitor.email,
    subject: "Your Visitor Request Has Been Submitted – Visitor Portal",
    html: `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ccc; padding: 20px;">
    <h2 style="color: #004080;">Visitor Pass System</h2>
    <p>Dear <strong>${visitor.name}</strong>,</p>

    <p>Your visitor request has been successfully submitted. The approver will review it shortly.</p>

    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <tr style="background-color: #f2f2f2;">
        <th style="text-align: left; padding: 8px; border: 1px solid #ccc;">Field</th>
        <th style="text-align: left; padding: 8px; border: 1px solid #ccc;">Details</th>
      </tr>
      <tr><td style="padding: 8px;">Name</td><td style="padding: 8px;">${
        visitor.name
      }</td></tr>
      <tr><td style="padding: 8px;">Email</td><td style="padding: 8px;">${
        visitor.email
      }</td></tr>
      <tr><td style="padding: 8px;">Mobile</td><td style="padding: 8px;">${
        visitor.mobile
      }</td></tr>
      <tr><td style="padding: 8px;">Visit Dates</td><td style="padding: 8px;">${visitor.startDate.toDateString()} – ${visitor.endDate.toDateString()}</td></tr>
      <tr><td style="padding: 8px;">Purpose</td><td style="padding: 8px;">${
        visitor.purpose
      }</td></tr>
    </table>

    <p>You will be notified once your request is reviewed.</p>

    <p style="margin-top: 40px; font-size: 12px; color: #888;">
      This is an automated message from Visitor Portal.
    </p>
  </div>
  `,
  });

  //Send email to approver with visitor details
  await transporter.sendMail({
    to: approver.email,
    subject: "New Visitor Approval Request – Visitor Portal",
    html: `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ccc; padding: 20px;">
    <h2 style="color: #004080;">Visitor Pass System</h2>
    <p>Dear <strong>${approver.username}</strong>,</p>

    <p>You have received a new visitor request. Below are the details:</p>

    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <tr style="background-color: #f2f2f2;">
        <th style="text-align: left; padding: 8px; border: 1px solid #ccc;">Field</th>
        <th style="text-align: left; padding: 8px; border: 1px solid #ccc;">Details</th>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ccc;">Visitor Name</td>
        <td style="padding: 8px; border: 1px solid #ccc;">${visitor.name}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ccc;">Email</td>
        <td style="padding: 8px; border: 1px solid #ccc;">${visitor.email}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ccc;">Mobile</td>
        <td style="padding: 8px; border: 1px solid #ccc;">${visitor.mobile}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ccc;">Visit Start Date</td>
        <td style="padding: 8px; border: 1px solid #ccc;">${visitor.startDate.toDateString()}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ccc;">Visit End Date</td>
        <td style="padding: 8px; border: 1px solid #ccc;">${visitor.endDate.toDateString()}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ccc;">Purpose</td>
        <td style="padding: 8px; border: 1px solid #ccc;">${
          visitor.purpose
        }</td>
      </tr>
    </table>

    <p>
      👉 <a href="http://localhost:3000/approver/${
        approver._id
      }/dashboard" style="color: #004080;">
        Click here to review and respond to the request
      </a>
    </p>

    <p style="margin-top: 40px; font-size: 12px; color: #888;">
      This is an automated message from Visitor Portal. Please do not reply to this email.
    </p>
  </div>
  `,
  });

  req.flash("success", "Visitor request submitted.");
  res.redirect(`/visitor/${req.user._id}/dashboard`);
};

module.exports.renderDashboard = async (req, res) => {
  const visitors = await Visitor.find({ approver: req.user._id });
  res.render("approver/dashboard", { allVisitors: visitors });
};

module.exports.userDashboard = async (req, res) => {
  const userId = req.params.id;

  if (req.user._id.toString() !== userId) {
    req.flash("error", "Unauthorized access.");
    return res.redirect("/");
  }

  res.render("visitor/userDashboard", { userId });
};

module.exports.viewHistory = async (req, res) => {
  const userId = req.params.id;

  if (req.user._id.toString() !== userId) {
    req.flash("error", "Unauthorized access.");
    return res.redirect("/");
  }

  const visitors = await Visitor.find({ createdBy: userId }).populate(
    "approver"
  );
  res.render("visitor/history", {
    visitors,
    userId: req.user._id,
    showBackButton: true,
  });
};
