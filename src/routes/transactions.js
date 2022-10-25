const express = require("express");

const transactionsRouter = express.Router();
const validate = require("../middlewares/validate");
const isLogin = require("../middlewares/isLogin");
const isAllowed = require("../middlewares/allowedRole");
const {
  create,
  drop,
  edit,
  get,
  getHistory,
  // sort,
} = require("../controllers/transactions");
transactionsRouter.post(
  "/create",
  isLogin(),
  validate.body(
    "user_id",
    "fee",
    "payment",
    "delivery",
    "promo_id",
    "notes",
    "status",
    "product_id",
    "size",
    "qty",
    "subtotal"
  ),
  create
);
transactionsRouter.delete(
  "/delete/:id",
  isLogin(),
  isAllowed("admin"),
  validate.params("id"),
  drop
);
transactionsRouter.patch(
  "/edit/:id",
  isLogin(),
  isAllowed("admin"),
  validate.params("id"),
  validate.body("status_id"),
  edit
);
transactionsRouter.get(
  "/",
  isLogin(),
  isAllowed("admin"),
  validate.body("sort", "page", "limit"),
  get
);
transactionsRouter.get(
  "/history",
  isLogin(),
  validate.body("sort", "page", "limit"),
  getHistory
);
// transactionsRouter.get("/history/sort/:id", sort);
module.exports = transactionsRouter;
