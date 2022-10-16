const authRouter = require("express").Router();

const authController = require("../controllers/auth");
const { login, logout } = authController;
const validate = require("../middlewares/validate");
const isLogin = require("../middlewares/isLogin");

authRouter.post("/", validate.body("email", "password"), login);
authRouter.delete("/", isLogin(), logout);

module.exports = authRouter;
