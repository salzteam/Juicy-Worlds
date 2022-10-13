const booksRepo = require("../repo/books");

const get = async (req, res) => {
  try {
    const response = await booksRepo.getBooks();
    res.status(200).json({
      result: response.rows,
    });
  } catch (err) {
    res.status(500).json({
      msg: "Internal Server Error",
    });
  }
};
const create = async (req, res) => {
  try {
    const response = await booksRepo.createBooks(req.body);
    res.status(201).json({
      result: response,
    });
  } catch (err) {
    res.status(500).json({ msg: "Internal Server Error" });
  }
};
const edit = async (req, res) => {
  try {
    const response = await booksRepo.editBooks(req.body, req.params);
    res.status(200).json({ result: response });
  } catch (err) {
    res.status(500).json({ msg: "Internal Server Error" });
  }
};
const drop = async (req, res) => {
  try {
    const result = await booksRepo.deleteBooks(req.params);
    res.status(200).json({ result });
  } catch (err) {
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

const bookController = {
  get,
  create,
  edit,
  drop,
};

module.exports = bookController;

// 2
// const bookController = {
//   get: async (req, res) => {
//     try {
//       const query = "select id, title, author from books";
//       const response = await postgreDb.query(query);
//       res.status(200).json({
//         result: response.rows,
//       });
//     } catch (err) {
//       console.log(err);
//       res.status(500).json({
//         msg: "Internal Server Error",
//       });
//     }
//   },
//   create: (req, res) => {
//     const query =
//       "insert into books (title, author, published_date, publisher) values ($1,$2,$3,$4)";
//     // for loop query += ",($5,$6,$7,$8)";
//     const { title, author, published_date, publisher } = req.body;
//     postgreDb.query(
//       query,
//       [title, author, published_date, publisher],
//       (err, queryResult) => {
//         if (err) {
//           console.log(err);
//           return res.status(500).json({ msg: "Internal Server Error" });
//         }
//         res.status(201).json({
//           result: queryResult,
//         });
//       }
//     );
//   },
//   edit: (req, res) => {
//     let query = "update books set ";
//     const values = [];
//     // {author, title, publisher}
//     // logika ini dibuat dengan mengasumsikan ada middleware validasi
//     // validasi untuk menghilangkan properti object dari body yang tidak diinginkan
//     Object.keys(req.body).forEach((key, idx, array) => {
//       if (idx === array.length - 1) {
//         query += `${key} = $${idx + 1} where id = $${idx + 2}`;
//         values.push(req.body[key], req.params.id);
//         return;
//       }
//       query += `${key} = $${idx + 1},`;
//       values.push(req.body[key]);
//     });
//     //   res.json({
//     //     query,
//     //     values,
//     //   });
//     postgreDb
//       .query(query, values)
//       .then((response) => {
//         res.status(200).json({ result: response });
//       })
//       .catch((err) => {
//         console.log(err);
//         res.status(500).json({ msg: "Internal Server Error" });
//       });
//   },
//   drop: (req, res) => {
//     const query = "delete from books where id = $1";
//     // OR => logika atau sql
//     // "OR" => string OR
//     postgreDb.query(query, [req.params.id], (err, result) => {
//       if (err) {
//         console.log(err);
//         return res.status(500).json({ msg: "Internal Server Error" });
//       }
//       res.status(200).json({ result });
//     });
//   },
// };

// module.exports = bookController

// 3
// module.exports = {
//   get: async (req, res) => {
//     try {
//       const query = "select id, title, author from books";
//       const response = await postgreDb.query(query);
//       res.status(200).json({
//         result: response.rows,
//       });
//     } catch (err) {
//       console.log(err);
//       res.status(500).json({
//         msg: "Internal Server Error",
//       });
//     }
//   },
//   create: (req, res) => {
//     const query =
//       "insert into books (title, author, published_date, publisher) values ($1,$2,$3,$4)";
//     // for loop query += ",($5,$6,$7,$8)";
//     const { title, author, published_date, publisher } = req.body;
//     postgreDb.query(
//       query,
//       [title, author, published_date, publisher],
//       (err, queryResult) => {
//         if (err) {
//           console.log(err);
//           return res.status(500).json({ msg: "Internal Server Error" });
//         }
//         res.status(201).json({
//           result: queryResult,
//         });
//       }
//     );
//   },
//   edit: (req, res) => {
//     let query = "update books set ";
//     const values = [];
//     // {author, title, publisher}
//     // logika ini dibuat dengan mengasumsikan ada middleware validasi
//     // validasi untuk menghilangkan properti object dari body yang tidak diinginkan
//     Object.keys(req.body).forEach((key, idx, array) => {
//       if (idx === array.length - 1) {
//         query += `${key} = $${idx + 1} where id = $${idx + 2}`;
//         values.push(req.body[key], req.params.id);
//         return;
//       }
//       query += `${key} = $${idx + 1},`;
//       values.push(req.body[key]);
//     });
//     //   res.json({
//     //     query,
//     //     values,
//     //   });
//     postgreDb
//       .query(query, values)
//       .then((response) => {
//         res.status(200).json({ result: response });
//       })
//       .catch((err) => {
//         console.log(err);
//         res.status(500).json({ msg: "Internal Server Error" });
//       });
//   },
//   drop: (req, res) => {
//     const query = "delete from books where id = $1";
//     // OR => logika atau sql
//     // "OR" => string OR
//     postgreDb.query(query, [req.params.id], (err, result) => {
//       if (err) {
//         console.log(err);
//         return res.status(500).json({ msg: "Internal Server Error" });
//       }
//       res.status(200).json({ result });
//     });
//   },
// };
