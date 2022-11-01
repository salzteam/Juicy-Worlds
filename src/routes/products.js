const express = require("express");
const productsRouter = express.Router();
const validate = require("../middlewares/validate");
const isLogin = require("../middlewares/isLogin");
const isAllowed = require("../middlewares/allowedRole");
const { create, drop, edit, get, getid } = require("../controllers/products");
const {
  diskUpload,
  memoryUpload,
  errorHandler,
} = require("../middlewares/upload");
const productUpload = require("../middlewares/productUpload.js");

productsRouter.post(
  "/",
  isLogin(),
  isAllowed("admin"),
  validate.body(
    "nameProduct",
    "priceProduct",
    "categoryproduct",
    "description"
  ),
  (req, res, next) =>
    memoryUpload.single("image")(req, res, (err) => {
      errorHandler(err, res, next);
    }),
  productUpload,
  validate.img(),
  create
);
productsRouter.delete(
  "/:id",
  isLogin(),
  isAllowed("admin"),
  validate.params("id"),
  drop
);
productsRouter.patch(
  "/:id",
  isLogin(),
  isAllowed("admin"),
  validate.params("id"),
  validate.body("product_name", "price", "category_id", "description"),
  (req, res, next) =>
    memoryUpload.single("image")(req, res, (err) => {
      errorHandler(err, res, next);
    }),
  productUpload,
  validate.img(),
  edit
);
productsRouter.get(
  "/",
  validate.params(
    "search",
    "filter",
    "sortby",
    "price",
    "transactions",
    "page",
    "limit"
  ),
  get
);
productsRouter.get("/:id", validate.params("id"), getid);
module.exports = productsRouter;
