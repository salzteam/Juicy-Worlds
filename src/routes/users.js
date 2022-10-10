const express = require("express");

const usersRouter = express.Router();
const { create, edit, get } = require("../controllers/users");
usersRouter.post("/", create);
usersRouter.patch("/:id", edit);
usersRouter.get("/", get);
module.exports = usersRouter;
