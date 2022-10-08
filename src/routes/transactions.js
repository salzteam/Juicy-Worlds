const express = require("express");

const transactionsRouter = express.Router();
const { create, drop, edit, get } = require("../controllers/transactions");
transactionsRouter.post("/", create);
transactionsRouter.delete("/:id", drop);
transactionsRouter.patch("/:id", edit);
transactionsRouter.get("/", get);
module.exports = transactionsRouter;
