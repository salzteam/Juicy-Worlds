const { Pool } = require("pg");
// const { Pool } = pg;

const db = new Pool({
  host: "localhost",
  user: "akshal",
  database: "juicyworld",
  password: "gumawangbk10",
  port: 5432,
});

module.exports = db;
