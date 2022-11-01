const express = require("express");

const usersRouter = express.Router();
const validate = require("../middlewares/validate");
const isLogin = require("../middlewares/isLogin");
const allowedRole = require("../middlewares/allowedRole");
const {
  diskUpload,
  memoryUpload,
  errorHandler,
} = require("../middlewares/upload");
const cloudinaryUploader = require("../middlewares/cloudinary");

const {
  createAccount,
  getUser,
  editPwd,
  editProfile,
  getUserProfile,
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
  (req, res, next) =>
    memoryUpload.single("image")(req, res, (err) => {
      errorHandler(err, res, next);
    }),
  cloudinaryUploader,
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
usersRouter.get("/:id", isLogin(), getUserProfile);

module.exports = usersRouter;
