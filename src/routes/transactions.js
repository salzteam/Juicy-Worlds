const express = require("express");

const transactionsRouter = express.Router();
const {
  create,
  drop,
  edit,
  get,
  getHistory,
  // sort,
} = require("../controllers/transactions");
transactionsRouter.post("/", create);
transactionsRouter.delete("/:id", drop);
transactionsRouter.patch("/:id", edit);
transactionsRouter.get("/", get);
transactionsRouter.get("/history/:id", getHistory);
// transactionsRouter.get("/history/sort/:id", sort);
module.exports = transactionsRouter;
