const express = require("express");
const productsRouter = express.Router();
const validate = require("../middlewares/validate");
const isLogin = require("../middlewares/isLogin");
const isAllowed = require("../middlewares/allowedRole");
const { create, drop, edit, get } = require("../controllers/products");
const multer = require("multer");
const uploadImage = require("../middlewares/upload");
function uploadFile(req, res, next) {
  const upload = uploadImage.single("image");
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(415).json({
        responseCode: 415,
        msg: "File too large, image must be 2MB or lower",
      });
    } else if (err) {
      return res.status(415).json({ responseCode: 415, msg: err.message });
    }
    next();
  });
}

productsRouter.post(
  "/",
  isLogin(),
  isAllowed("admin"),
  validate.body("nameProduct", "priceProduct", "categoryproduct"),
  uploadFile,
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
  uploadFile,
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
