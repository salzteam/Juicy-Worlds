const postgreDb = require("../config/postgre");

const getBooks = () => {
  return new Promise((resolve, reject) => {
    const query = "select id, title, author from books";
    postgreDb.query(query, (err, result) => {
      if (err) {
        console.log(err);
        return reject(err);
      }
      return resolve(result);
    });
  });
};
const createBooks = (body) => {
  return new Promise((resolve, reject) => {
    const query =
      "insert into books (title, author, published_date, publisher) values ($1,$2,$3,$4)";
    // for loop query += ",($5,$6,$7,$8)";
    const { title, author, published_date, publisher } = body;
    postgreDb.query(
      query,
      [title, author, published_date, publisher],
      (err, queryResult) => {
        if (err) {
          console.log(err);
          return reject(err);
        }
        resolve(queryResult);
      }
    );
  });
};
const editBooks = (body, params) => {
  return new Promise((resolve, reject) => {
    let query = "update books set ";
    const values = [];
    // {author, title, publisher}
    // logika ini dibuat dengan mengasumsikan ada middleware validasi
    // validasi untuk menghilangkan properti object dari body yang tidak diinginkan
    Object.keys(body).forEach((key, idx, array) => {
      if (idx === array.length - 1) {
        query += `${key} = $${idx + 1} where id = $${idx + 2}`;
        values.push(body[key], params.id);
        return;
      }
      query += `${key} = $${idx + 1},`;
      values.push(body[key]);
    });
    //   res.json({
    //     query,
    //     values,
    //   });
    postgreDb
      .query(query, values)
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};
const deleteBooks = (params) => {
  return new Promise((resolve, reject) => {
    const query = "delete from books where id = $1";
    // OR => logika atau sql
    // "OR" => string OR
    postgreDb.query(query, [params.id], (err, result) => {
      if (err) {
        console.log(err);
        return reject(err);
      }
      resolve(result);
    });
  });
};

const booksRepo = {
  getBooks,
  createBooks,
  editBooks,
  deleteBooks,
};

module.exports = booksRepo;
