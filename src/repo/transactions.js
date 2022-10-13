const postgreDb = require("../config/postgre");

const createTransactions = (body) => {
  return new Promise((resolve, reject) => {
    const {
      user_id,
      fee,
      payment,
      delivery,
      promo_id,
      notes,
      status,
      product_id,
      size,
      qty,
      subtotal,
    } = body;
    const query =
      "insert into transactions (user_id, tax, payment_id, delivery_id, promo_id, notes, status) values ($1,$2,$3,$4,$5,$6,$7) RETURNING id";
    postgreDb.query(
      query,
      [user_id, fee, payment, delivery, promo_id, notes, status],
      (err, queryResult) => {
        if (err) {
          console.log(err);
          return reject(err);
        }
        const valuUser = queryResult.rows[0].id;
        postgreDb.query(
          "insert into transactions_product_sizes (transaction_id, product_id, size_id, qty, subtotal) values ($1,$2,$3,$4,$5)",
          [valuUser, product_id, size, qty, subtotal],
          (err, queryResult) => {
            if (err) {
              console.log(err);
              return reject(err);
            }
            const ress = {
              id: valuUser,
              tax: fee,
              payment: payment,
              delivery: product_id,
              promo_id: promo_id,
              notes: notes,
              status: status,
              product_id: product_id,
              size: size,
              qty: qty,
              subtotal: subtotal,
            };
            resolve(ress);
          }
        );
      }
    );
  });
};

const deleteTransactions = (params) => {
  return new Promise((resolve, reject) => {
    const query2 = "delete from transactions where id = $1";
    const query1 =
      "delete from transactions_product_sizes where transaction_id = $1";
    postgreDb
      .query(query1, [params.id])
      .then(postgreDb.query(query2, [params.id]))
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const editTransactions = (body, params) => {
  return new Promise((resolve, reject) => {
    Object.keys(body).forEach((key) => {
      let query = "";
      let values = [body[key], params.id];
      if (
        key == "transaction_id" ||
        key == "product_id" ||
        key == "size_id" ||
        key == "qty" ||
        key == "subtotal"
      )
        query += `update transactions_product_sizes set ${key} = $1 where transaction_id = $2`;
      else if (
        key == "user_id" ||
        key == "tax" ||
        key == "payment_id" ||
        key == "delivery_id" ||
        key == "promo_id" ||
        key == "notes" ||
        key == "status"
      )
        query += `update transactions set ${key} = $1,updated_at = now() where id = $2`;
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
  });
};

const getTransactions = (queryParams) => {
  return new Promise((resolve, reject) => {
    let query =
      "select tpm.transaction_id, ud.display_name, p.product_name, p.price, ct.category_name, t.tax, pm.method, d.method, d.shipping, d.minimum_distance, d.charge_cost, ps.code, ps.discount, t.notes, t.status, s.size, s.cost, tpm.qty, tpm.subtotal from transactions_product_sizes tpm left join transactions t on tpm.transaction_id = t.id join userdata ud on t.user_id = ud.user_id join users u on ud.user_id = u.id join products p on tpm.product_id = p.id join categories ct on p.category_id = ct.id join payments pm on t.payment_id = pm.id join deliveries d on t.delivery_id = d.id FULL OUTER join promos ps on t.promo_id = ps.id join sizes s on tpm.size_id = s.id";
    if (queryParams.sort == "newest") query += " order by t.created_at desc";
    if (queryParams.sort == "oldest") query += " order by t.created_at asc";
    if (queryParams.sort == "pricey") query += " order by tpm.subtotal desc";
    if (queryParams.sort == "cheap") query += " order by tpm.subtotal asc";
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

const transactionsRepo = {
  createTransactions,
  deleteTransactions,
  editTransactions,
  getTransactions,
  historyTransactions,
  // sortingHistory,
};

module.exports = transactionsRepo;
