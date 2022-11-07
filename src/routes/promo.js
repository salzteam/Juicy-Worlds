const express = require("express");

const promoRouter = express.Router();
const validate = require("../middlewares/validate");
const isLogin = require("../middlewares/isLogin");
const isAllowed = require("../middlewares/allowedRole");
const { create, drop, get, edit, getid } = require("../controllers/promo");
const {
  diskUpload,
  memoryUpload,
  errorHandler,
} = require("../middlewares/upload");
const promoUpload = require("../middlewares/promoUpload");
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
  promoUpload,
  validate.img(),
  create
);
promoRouter.patch(
  "/edit/:id",
  isLogin(),
  isAllowed("admin"),
  validate.params("id"),
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
  promoUpload,
  validate.img(),
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
promoRouter.get("/:id", getid);
module.exports = promoRouter;
