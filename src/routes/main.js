const express = require("express");

const usersRouter = require("./users");
const productsRouter = require("./products");
const transactionRouter = require("./transactions");
const promoRouter = require("./promo");
const authRouter = require("./auth");
const imageUpload = require("../middlewares/upload");
const mainRouter = express.Router();
const prefix = "/api/v1";
mainRouter.use(`${prefix}/users`, usersRouter);
mainRouter.use(`${prefix}/products`, productsRouter);
mainRouter.use(`${prefix}/promo`, promoRouter);
mainRouter.use(`${prefix}/transactions`, transactionRouter);
mainRouter.use(`${prefix}/auth`, authRouter);
mainRouter.get("/", (req, res) => {
  res.json({
    msg: "Welcome",
  });
});

module.exports = mainRouter;
