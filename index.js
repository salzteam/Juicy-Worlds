const express = require("express");

const postgreDb = require("./src/config/postgre");
const mainRouter = require("./src/routes/main");
const server = express();
const PORT = 8080;

postgreDb
  .connect()
  .then(() => {
    console.log("DB connected");
    server.use(express.json());
    server.use(express.urlencoded({ extended: false }));
    server.use(mainRouter);
    server.listen(PORT, () => {
      console.log(`Server is running at port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
