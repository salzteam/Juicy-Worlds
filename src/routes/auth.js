const authRouter = require("express").Router();

const authController = require("../controllers/auth");
const { login, logout, forgot } = authController;
const validate = require("../middlewares/validate");
const isLogin = require("../middlewares/isLogin");

authRouter.post("/", validate.body("email", "password"), login);
authRouter.delete("/", isLogin(), logout);
authRouter.patch("/", validate.params("email", "otp", "new_password"), forgot);

module.exports = authRouter;
