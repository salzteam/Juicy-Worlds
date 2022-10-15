const authRouter = require("express").Router();

const authController = require("../controllers/auth");
const { login } = authController;
const validate = require("../middlewares/validate");

authRouter.post("/", validate.body("email", "password"), login);
authRouter.delete("/", (req, res) => {});

module.exports = authRouter;
