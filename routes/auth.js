// router.post(
//   "/login",
//   passport.authenticate("local", {
//     failureFlash: true,
//     failureRedirect: "/login",
//   }),
//   (req, res) => {
//     const redirectUrl =
//       req.user.role === "admin" ? "/admin/dashboard" : "/user/dashboard";
//     res.redirect(redirectUrl);
//   }
// );
