const express = require("express");

const promoRouter = express.Router();
const { create, drop, edit, get, search } = require("../controllers/promo");
promoRouter.post("/", create);
promoRouter.delete("/:id", drop);
promoRouter.patch("/:id", edit);
promoRouter.get("/", get);
promoRouter.get("/search", search);
module.exports = promoRouter;
