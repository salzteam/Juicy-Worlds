const express = require("express");

const booksRouter = express.Router();
const { get, create, edit, drop } = require("../controllers/books");
// http://localhost:8080/api/v1/books/
booksRouter.get("/", get);

booksRouter.post("/", create);

// id
// /api/v1/books/{id}
// params => req.params.namaVariabel
booksRouter.patch("/:id", edit);

booksRouter.delete("/:id", drop);

module.exports = booksRouter;
