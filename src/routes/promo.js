const express = require("express");

const promoRouter = express.Router();
const validate = require("../middlewares/validate");
const isLogin = require("../middlewares/isLogin");
const isAllowed = require("../middlewares/allowedRole");
const { create, drop, get, edit } = require("../controllers/promo");
promoRouter.post(
  "/create",
  isLogin(),
  isAllowed("admin"),
  validate.body("code", "discount", "product_id"),
  create
);
promoRouter.patch(
  "/edit/:id",
  isAllowed("admin"),
  isLogin(),
  validate.params("id"),
  validate.body("code", "discount", "product_id"),
  edit
);
promoRouter.delete(
  "/delete/:id",
  isLogin(),
  isAllowed("admin"),
  validate.params("id"),
  drop
);
promoRouter.get("/", get);
module.exports = promoRouter;
