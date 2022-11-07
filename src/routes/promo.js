const express = require("express");

const promoRouter = express.Router();
const validate = require("../middlewares/validate");
const isLogin = require("../middlewares/isLogin");
const isAllowed = require("../middlewares/allowedRole");
const { create, drop, get, edit } = require("../controllers/promo");
const {
  diskUpload,
  memoryUpload,
  errorHandler,
} = require("../middlewares/upload");
const productUpload = require("../middlewares/productUpload.js");
// promoRouter.post(
//   "/create",
//   isLogin(),
//   isAllowed("admin"),
//   validate.body("code", "discount", "product_id"),
//   create
// );
promoRouter.post(
  "/create",
  isLogin(),
  isAllowed("admin"),
  validate.body(
    "code",
    "discount",
    "product_id",
    "start",
    "end",
    "color",
    "title",
    "desc"
  ),
  (req, res, next) =>
    memoryUpload.single("image")(req, res, (err) => {
      errorHandler(err, res, next);
    }),
  productUpload,
  validate.img(),
  create
);
promoRouter.patch(
  "/edit/:id",
  isLogin(),
  isAllowed("admin"),
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
