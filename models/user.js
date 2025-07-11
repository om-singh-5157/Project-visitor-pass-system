const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  // mobile: {
  //   type: String,
  //   required: true,
  // },
  role: {
    type: String,
    enum: ["approver", "user","admin"],
    default: "user",
  },
});

UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", UserSchema);
