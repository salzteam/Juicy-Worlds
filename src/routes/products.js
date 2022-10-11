const express = require("express");

const productsRouter = express.Router();
const {
  create,
  drop,
  edit,
  get,
  search,
  filter,
  sorting,
} = require("../controllers/products");
productsRouter.post("/", create);
productsRouter.delete("/:id", drop);
productsRouter.patch("/:id", edit);
productsRouter.get("/", get);
productsRouter.get("/search", search);
productsRouter.get("/search/filter", filter);
productsRouter.get("/search/sorting", sorting);
module.exports = productsRouter;
