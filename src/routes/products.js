const express = require("express");

const productsRouter = express.Router();
const { create, drop, edit, get } = require("../controllers/products");
productsRouter.post("/", create);
productsRouter.delete("/:id", drop);
productsRouter.patch("/:id", edit);
productsRouter.get("/", get);
module.exports = productsRouter;
