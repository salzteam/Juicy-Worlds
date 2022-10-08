const express = require("express");

const usersRouter = require("./users");
const productsRouter = require("./products");
const transactionRouter = require("./transactions");
const promoRouter = require("./promo");
const mainRouter = express.Router();
const prefix = "/api/v1";
mainRouter.use(`${prefix}/users`, usersRouter);
mainRouter.use(`${prefix}/products`, productsRouter);
mainRouter.use(`${prefix}/promo`, promoRouter);
mainRouter.use(`${prefix}/transactions`, transactionRouter);
mainRouter.get("/", (req, res) => {
  res.json({
    msg: "Welcome",
  });
});
module.exports = mainRouter;
