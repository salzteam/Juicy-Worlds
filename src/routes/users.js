const express = require("express");

const usersRouter = express.Router();
const validate = require("../middlewares/validate");
const isLogin = require("../middlewares/isLogin");
const allowedRole = require("../middlewares/allowedRole");
const uploadImage = require("../middlewares/upload");
const upload = uploadImage.single("image");

const {
  createAccount,
  getUser,
  editPwd,
  createProfile,
  editProfile,
} = require("../controllers/users");

usersRouter.post(
  "/register",
  validate.email("email", "password", "phone"),
  createAccount
);
usersRouter.post(
  "/profile",
  isLogin(),
  validate.body(
    "displayName",
    "firstname",
    "lastname",
    "date_of_birth",
    "adress",
    "gender"
  ),
  upload,
  validate.img(),
  createProfile
);
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
  upload,
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
