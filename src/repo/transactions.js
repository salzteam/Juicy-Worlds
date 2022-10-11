const postgreDb = require("../config/postgre");

const createTransactions = (body) => {
  return new Promise((resolve, reject) => {
    const query =
      "insert into transactions (user_id, product_id, timeset, payment, promo_id) values ($1,$2,$3,$4,$5)";
    const { user_id, product_id, timeset, payment, promo_id } = body;
    const ress = [user_id, product_id, timeset, payment, promo_id];
    postgreDb.query(
      query,
      [user_id, product_id, timeset, payment, promo_id],
      (err, queryResult) => {
        if (err) {
          console.log(err);
          return reject(err);
        }
        resolve(ress);
      }
    );
  });
};

const deleteTransactions = (params) => {
  return new Promise((resolve, reject) => {
    const query = "delete from transactions where transaction_id = $1";
    postgreDb.query(query, [params.id], (err, result) => {
      if (err) {
        console.log(err);
        return reject(err);
      }
      resolve(result);
    });
  });
};
const editTransactions = (body, params) => {
  return new Promise((resolve, reject) => {
    let query = "update transactions set ";
    const values = [];
    Object.keys(body).forEach((key, idx, array) => {
      if (idx === array.length - 1) {
        query += `${key} = $${
          idx + 1
        }, update_at = now() where transaction_id = $${idx + 2}`;
        values.push(body[key], params.id);
        return;
      }
      query += `${key} = $${idx + 1},`;
      values.push(body[key]);
    });
    postgreDb
      .query(query, values)
      .then((response) => {
        resolve([body, params.id]);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};
const getTransactions = () => {
  return new Promise((resolve, reject) => {
    const query =
      "select t.transaction_id, u.displayname, u.adress, p.name_product , p.price ,p.size , p.category ,p.deliv_method, t.payment , t.timeset , t.create_at  from transactions t join users u  on t.user_id = u.users_id  join products p  on t.product_id = p.products_id";
    postgreDb.query(query, (err, result) => {
      if (err) {
        console.log(err);
        return reject(err);
      }
      return resolve(result);
    });
  });
};
const historyTransactions = (params) => {
  return new Promise((resolve, reject) => {
    const query =
      "select u.displayname, u.adress, p.name_product , p.price ,p.size , p.category ,p.deliv_method, t.payment , t.timeset , t.create_at  from transactions t join users u  on t.user_id = u.users_id  join products p  on t.product_id = p.products_id where u.users_id = $1";
    postgreDb.query(query, [params.id], (err, result) => {
      if (err) {
        console.log(err);
        return reject(err);
      }
      return resolve(result);
    });
  });
};
// const sortingHistory = (queryParams, params) => {
//   return new Promise((resolve, reject) => {
//     let query =
//       "select u.displayname, u.adress, p.name_product , p.price ,p.size , p.category ,p.deliv_method, t.payment , t.timeset , t.create_at  from transactions t join users u  on t.user_id = u.users_id  join products p  on t.product_id = p.products_id where ";
//     const values = [];
//     console.log(query);
//     Object.keys(queryParams).forEach((key, idx) => {
//       query += `u.users_id = $${idx + 1} order by t.${key} `;
//       values.push(queryParams[key], params.id);
//     });
//     console.log(query);
//     postgreDb
//       .query(query)
//       .then((response) => {
//         resolve(response);
//       })
//       .catch((err) => {
//         console.log(err);
//         reject(err);
//       });
//   });
// };

const transactionsRepo = {
  createTransactions,
  deleteTransactions,
  editTransactions,
  getTransactions,
  historyTransactions,
  // sortingHistory,
};

module.exports = transactionsRepo;
