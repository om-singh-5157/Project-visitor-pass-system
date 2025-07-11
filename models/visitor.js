const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const visitorSchema = new Schema({
  name: {
    type: String,
    required: [true, "Visitor name is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
  },
  mobile: {
    type: String,
    required: [true, "Mobile number is required"],
    // match: [/^(\+91)?[6-9]\d{9}$/, "Mobile number must be 10 digits"],
  },
  dob: {
    type: Date,
    required: [true, "Date of birth is required"],
  },
  startDate: {
    type: Date,
    required: [true, "Start date is required"],
  },
  endDate: {
    type: Date,
    required: [true, "End date is required"],
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  approver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  purpose: {
    type: String,
    required: [true, "Purpose of visit is required"],
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  passPdf: String,
});

module.exports = mongoose.model("Visitor", visitorSchema);
