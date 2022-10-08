const express = require("express");

const usersRouter = express.Router();
const { create, drop, edit, get } = require("../controllers/users");
usersRouter.post("/", create);
usersRouter.delete("/:id", drop);
usersRouter.patch("/:id", edit);
usersRouter.get("/", get);
module.exports = usersRouter;
