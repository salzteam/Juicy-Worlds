const express = require("express");

const usersRouter = express.Router();
const validate = require("../middlewares/validate");
const isLogin = require("../middlewares/isLogin");
const allowedRole = require("../middlewares/allowedRole");
const multer = require("multer");
const uploadImage = require("../middlewares/upload");
function uploadFile(req, res, next) {
  const upload = uploadImage.single("image");
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      console.log(err.code);
      return res.status(415).json({ responseCode: 415, msg: err.code });
    } else if (err) {
      console.log(err.message);
      return res.status(415).json({ responseCode: 415, msg: err.message });
    }
    next();
  });
}

const {
  createAccount,
  getUser,
  editPwd,
  editProfile,
} = require("../controllers/users");

usersRouter.post(
  "/register",
  validate.email("email", "password", "phone"),
  createAccount
);
// usersRouter.post(
//   "/profile",
//   isLogin(),
//   validate.body(
//     "displayName",
//     "firstname",
//     "lastname",
//     "date_of_birth",
//     "adress",
//     "gender"
//   ),
//   uploadFile,
//   validate.img(),
//   createProfile
// );
usersRouter.patch(
  "/profile/edit",
  isLogin(),
  validate.body(
    "display_name",
    "firstname",
    "lastname",
    "date_of_birth",
    "adress",
    "gender"
  ),
  uploadFile,
  validate.img(),
  editProfile
);
usersRouter.patch(
  "/account",
  isLogin(),
  validate.body("password", "new_password"),
  editPwd
);
usersRouter.get("/", isLogin(), allowedRole("admin"), getUser);

module.exports = usersRouter;
