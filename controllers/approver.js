const Visitor = require("../models/visitor.js");
const User = require("../models/user");
const transporter = require("../utils/mailer");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

module.exports.renderDashboard = async (req, res) => {
  const approverId = req.params.id;
  if (req.user._id.toString() !== approverId) {
    req.flash("error", "Access denied.");
    return res.redirect("/");
  }
  const visitors = await Visitor.find({ approver: approverId });
  res.render("approver/dashboard", { allVisitors: visitors });
};

module.exports.approveVisitor = async (req, res) => {
  const visitor = await Visitor.findById(req.params.id).populate(
    "createdBy approver"
  );
  if (!visitor) return res.redirect("back");

  visitor.status = "approved";
  const remarks = req.body.remarks || "No remarks provided.";

  // ✅ Generate PDF visitor pass
  const pdfDir = path.join(__dirname, "../public/passes");
  if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });
  const pdfPath = path.join(pdfDir, `pass-${visitor._id}.pdf`);
  const pdfPublicPath = `/passes/pass-${visitor._id}.pdf`;
  const doc = new PDFDocument({
    size: [550, 350],
    margins: { top: 30, bottom: 30, left: 30, right: 30 },
  });
  doc.pipe(fs.createWriteStream(pdfPath));

  // Yellow background
  // Background
  doc.rect(0, 0, 550, 350).fill("#f4f4f4");

  // Outer border box
  doc.lineWidth(1).strokeColor("#343a40").rect(10, 10, 530, 330).stroke();

  // Header
  doc
    .fillColor("#003366")
    .font("Helvetica-Bold")
    .fontSize(16)
    .text("VISITOR GATE PASS", 0, 20, { align: "center" })
    .moveDown(0.2)
    .fontSize(10)
    .fillColor("black")
    .text("Authorized Access for Registered Visitors", { align: "center" });

  // Section title
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor("#000")
    .text("Pass For: Visitor", 20, 50);

  // Inner detail box
  doc.lineWidth(0.5).strokeColor("#6c757d").rect(20, 70, 510, 200).stroke();

  // Fields
  doc.font("Helvetica").fontSize(9).fillColor("#000");

  // Visitor Info (Left-aligned inside the box)
  const lineSpacing = 20;
  let y = 80;

  doc.text(`Visitor Name: ${visitor.name}`, 30, y);
  doc.text(`Email: ${visitor.email}`, 30, (y += lineSpacing));
  doc.text(`Mobile: ${visitor.mobile}`, 30, (y += lineSpacing));
  doc.text(`Purpose: ${visitor.purpose}`, 30, (y += lineSpacing));
  doc.text(
    `Visit Start: ${visitor.startDate.toDateString()}`,
    30,
    (y += lineSpacing)
  );
  doc.text(
    `Visit End: ${visitor.endDate.toDateString()}`,
    30,
    (y += lineSpacing)
  );

  // Status badge style
  doc
    .font("Helvetica-Bold")
    .fillColor(
      visitor.status === "approved"
        ? "#198754"
        : visitor.status === "rejected"
        ? "#dc3545"
        : "#ffc107"
    )
    .text(`Status: ${visitor.status.toUpperCase()}`, 30, (y += lineSpacing));

  // Approver info
  doc
    .font("Helvetica")
    .fillColor("#000")
    .text(`Approved By: ${visitor.approver.username}`, 30, (y += lineSpacing));

  // Footer disclaimer
  doc
    .fontSize(8)
    .fillColor("#6c757d")
    .text(
      "Please carry a valid photo ID. This pass is non-transferable and valid only for the specified dates.",
      20,
      285,
      {
        width: 510,
        align: "center",
      }
    );

  // // Bottom bar
  // doc.moveTo(20, 290).lineTo(530, 290).stroke();
  // doc
  //   .font("Courier-Bold")
  //   .fontSize(10)
  //   .text(`TSP/${visitor._id.toString().slice(-6)}/0525`, 25, 295);

  // Finalize PDF
  doc.end();

  // Save PDF path in DB
  visitor.passPdf = `/passes/pass-${visitor._id}.pdf`;
  await visitor.save();

  // ✅ Email notification
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ccc; padding: 20px;">
      <h2 style="color: #004080;">Visitor Request Approved ✅</h2>
      <p>Dear ${visitor.name},</p>
      <p>Your visitor request has been <strong>approved</strong> by <strong>${
        visitor.approver.username
      }</strong>.</p>
      <p><strong>Remarks:</strong> ${remarks}</p>
      <p>You can download your visitor pass from your dashboard or using the link below:</p>
      <p><a href="http://localhost:3000${pdfPublicPath}" style="color: #004080;">Download Visitor Pass (PDF)</a></p>

      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr style="background-color: #f2f2f2;">
          <th style="padding: 8px; border: 1px solid #ccc;">Field</th>
          <th style="padding: 8px; border: 1px solid #ccc;">Details</th>
        </tr>
        <tr><td style="padding: 8px;">Name</td><td style="padding: 8px;">${
          visitor.name
        }</td></tr>
        <tr><td style="padding: 8px;">Email</td><td style="padding: 8px;">${
          visitor.email
        }</td></tr>
        <tr><td style="padding: 8px;">Visit Dates</td><td style="padding: 8px;">${visitor.startDate.toDateString()} – ${visitor.endDate.toDateString()}</td></tr>
        <tr><td style="padding: 8px;">Status</td><td style="padding: 8px;">${
          visitor.status
        }</td></tr>
      </table>
      <p>Thank you for using the Visitor Portal.</p>
    </div>
  `;

  try {
    if (visitor.email) {
      await transporter.sendMail({
        to: visitor.email,
        subject: `Your Visitor Request Has Been Approved – Tata Steel`,
        html: emailHtml,
      });
    }
  } catch (e) {
    console.error("Mail send failed:", e.message);
  }

  req.flash("success", `Visitor approved and pass generated.`);
  res.redirect(`/approver/${req.user._id}/dashboard`);
};

module.exports.rejectVisitor = async (req, res) => {
  const visitor = await Visitor.findById(req.params.id).populate(
    "createdBy approver"
  );
  if (!visitor) return res.redirect("back");

  visitor.status = "rejected";
  await visitor.save();
  const remarks = req.body.remarks || "No remarks provided.";

  const decision = "Rejected ❌";
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ccc; padding: 20px;">
      <h2 style="color: #004080;">Visitor Request ${decision}</h2>

      <p>Dear ${visitor.name},</p>
      <p>Your visitor request has been <strong>${
        visitor.status
      }</strong> by the approver <strong>${
    visitor.approver.username
  }</strong>.</p>
  <p><strong>Remarks:</strong> ${remarks}</p>

      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr style="background-color: #f2f2f2;">
          <th style="padding: 8px; border: 1px solid #ccc;">Field</th>
          <th style="padding: 8px; border: 1px solid #ccc;">Details</th>
        </tr>
        <tr><td style="padding: 8px;">Name</td><td style="padding: 8px;">${
          visitor.name
        }</td></tr>
        <tr><td style="padding: 8px;">Email</td><td style="padding: 8px;">${
          visitor.email
        }</td></tr>
        <tr><td style="padding: 8px;">Visit Dates</td><td style="padding: 8px;">${visitor.startDate.toDateString()} – ${visitor.endDate.toDateString()}</td></tr>
        <tr><td style="padding: 8px;">Status</td><td style="padding: 8px;">${
          visitor.status
        }</td></tr>
      </table>

      <p>Thank you for using the Visitor Portal.</p>
    </div>
  `;

  try {
    if (visitor.email) {
      await transporter.sendMail({
        to: visitor.email,
        subject: `Your Request Has Been REJECTED`,
        html: emailHtml,
      });
    }
  } catch (e) {
    console.error("Mail send failed:", e.message);
  }

  req.flash("success", `Visitor ${visitor.status}.`);
  res.redirect(`/approver/${req.user._id}/dashboard`);
};
