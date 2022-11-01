require("dotenv").config();
require("./src/config/redis");
const express = require("express");
const mainRouter = require("./src/routes/main");
const morgan = require("morgan");
const server = express();
const { PORT } = process.env;
const cors = require("cors");

server.use(express.static("./public"));
server.use(express.json());
server.use(cors());
server.use(express.urlencoded({ extended: false }));
server.use(
  morgan(":method :url :status :res[content-length] - :response-time ms")
);
server.use(mainRouter);
server.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});
