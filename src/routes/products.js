const express = require("express");

const productsRouter = express.Router();
const validate = require("../middlewares/validate");
const isLogin = require("../middlewares/isLogin");
const isAllowed = require("../middlewares/allowedRole");
const uploadImage = require("../middlewares/upload");
const { create, drop, edit, get } = require("../controllers/products");
const upload = uploadImage.single("image");

productsRouter.post(
  "/",
  isLogin(),
  isAllowed("admin"),
  validate.body("nameProduct", "priceProduct", "categoryproduct"),
  upload,
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
  validate.body("product_name", "price", "category_id"),
  upload,
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
module.exports = productsRouter;
