const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const ExpressError = require("./utils/ExpressError");
const User = require("./models/user");

const MONGO_URL = "mongodb://127.0.0.1:27017/iProject";

main()
  .then((res) => {
    console.log("connected to DB1");
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(MONGO_URL);
}

// async function createAdminIfNotExists() {
//   const existing = await User.findOne({ username: "admin" });
//   if (!existing) {
//     const admin = new User({
//       username: "admin",
//       email: "admin@example.com",
//       role: "admin",
//     });
//     await User.register(admin, "omsingh5157");
//     console.log("✅ Admin user created");
//   } else {
//     console.log("⚠️ Admin already exists");
//   }
// }
// createAdminIfNotExists();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

const sessionOptions = {
  secret: "thisshouldbeabettersecret!",
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({ mongoUrl: MONGO_URL }),
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

const adminRoutes = require("./routes/admin");
const userRoutes = require("./routes/user");
const visitorRoutes = require("./routes/visitor");
const approverRoutes = require("./routes/approver");

app.use("/", userRoutes);
app.use("/admin", adminRoutes);
app.use("/visitor", visitorRoutes);
app.use("/approver", approverRoutes);

app.get("/", (req, res) => {
  res.render("home");
});

// app.all("*", (req, res, next) => {
//   console.log("Unmatched route:", req.path);
//   next(new ExpressError(404, "Page Not Found"));
// });

app.use((err, req, res, next) => {
  console.error(err);
  const { status = 500, message = "Something went wrong" } = err;
  res.status(status).render("error", { err });
});

app.listen(3000, () => {
  console.log("server is listening to port 3000");
});
