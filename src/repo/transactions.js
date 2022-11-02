const response = require("../helpers/response");
const {
  success,
  notFound,
  systemError,
  created,
} = require("../helpers/templateResponse");
const postgreDb = require("../config/postgre");

const transaction = (body, token) => {
  return new Promise((resolve, reject) => {
    postgreDb.connect((err, client, done) => {
      const shouldAbort = (err) => {
        if (err) {
          console.error("Error in transaction", err.stack);
          resolve(invalidParameter());
          client.query("ROLLBACK", (err) => {
            if (err) {
              console.log(systemError(err.stack));
              resolve(systemError(err.stack));
            }
            done();
          });
        }
        return !!err;
      };
      client.query("BEGIN", (err) => {
        if (shouldAbort(err)) return;
        let {
          fee,
          payment,
          delivery,
          promo_id,
          notes,
          product_id,
          size,
          qty,
          subtotal,
          status_id,
        } = body;
        if (fee == null) fee = 0;
        if (payment == null) payment = 4;
        if (delivery == null) delivery = 0;
        if (promo_id == null) promo_id = 999;
        if (notes == null) notes = "-";
        if (product_id == null) product_id = 0;
        if (qty == null) qty = 0;
        if (subtotal == null) subtotal = 0;
        if (status_id == null) status_id = 1;
        console.log(delivery);
        const queryAddress = "SELECT adress from userdata where user_id = $1";
        client.query(queryAddress, [token.user_id], (err, resAddress) => {
          let address = " ";
          if (shouldAbort(err)) return;
          if (resAddress.rows[0].adress) address = resAddress.rows[0].adress;
          const queryText =
            "insert into transactions (user_id, tax, payment_id, delivery_id, promo_id, notes, address, status_id) values ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id";
          client.query(
            queryText,
            [
              token.user_id,
              fee,
              payment,
              delivery,
              promo_id,
              notes,
              address,
              status_id,
            ],
            (err, res) => {
              if (shouldAbort(err)) return;
              const insertPivot =
                "insert into transactions_product_sizes (transaction_id, product_id, size_id, qty, subtotal) values ($1,$2,$3,$4,$5)";
              const valuUser = res.rows[0].id;
              client.query(
                insertPivot,
                [valuUser, product_id, size, qty, subtotal],
                (err, res) => {
                  client.query(
                    "select * from products where id = $1",
                    [product_id],
                    (err, rest) => {
                      client.query(
                        "select * from sizes where id = $1",
                        [size],
                        (err, resSize) => {
                          let discount = [];
                          if (promo_id) {
                            client.query(
                              "select * from promos where product_id = $1",
                              [product_id],
                              (err, resPromo) => {
                                discount.push(resPromo.rows[0]);
                              }
                            );
                          }
                          console.log(discount);
                          client.query(
                            "select * from deliveries where id = $1",
                            [delivery],
                            (err, resDeliv) => {
                              if (shouldAbort(err)) return;
                              client.query("COMMIT", (err) => {
                                if (err) {
                                  console.error(
                                    "Error committing transaction",
                                    err.stack
                                  );
                                  resolve(systemError());
                                }
                                resolve(
                                  created({
                                    id_transactions: valuUser,
                                    tax: fee,
                                    payment: payment,
                                    delivery_id: product_id,
                                    shipping: resDeliv.rows[0].shipping,
                                    minimun_distance:
                                      resDeliv.rows[0].minimun_distance,
                                    charge_cost: resDeliv.rows[0].charge_cost,
                                    promo_id: promo_id,
                                    discount: discount[2],
                                    notes: notes,
                                    status: "pending",
                                    address: address,
                                    product_id: product_id,
                                    product_name: rest.rows[0].product_name,
                                    price: rest.rows[0].price,
                                    size: size,
                                    cost_sizes: resSize.rows[0].cost,
                                    qty: qty,
                                    subtotal: subtotal,
                                  })
                                );
                                done();
                              });
                            }
                          );
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        });
      });
    });
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
        resolve(success(`${response.command} transactions id ${params.id}`));
      })
      .catch((err) => {
        console.log(err);
        resolve(systemError());
      });
  });
};

const editTransactions = (body, params) => {
  return new Promise((resolve, reject) => {
    let status = "";
    Object.keys(body).forEach((key) => {
      let query = "";
      let values = [body[key], params.id];
      let data = {
        id: params.id,
      };
      if (body[key] == "1") status = "PENDING";
      if (body[key] == "2") status = "PAID";
      if (body[key] == "3") status = "DONE";
      if (body[key] == "4") status = "CANCEL";
      body["status_id"] = status;
      data[key] = body[key];
      query += `update transactions set ${key} = $1,updated_at = now() where id = $2`;
      postgreDb
        .query(query, values)
        .then((response) => {
          resolve(success(data));
        })
        .catch((err) => {
          console.log(err);
          resolve(systemError());
        });
    });
  });
};
const payment = (body, params) => {
  return new Promise((resolve, reject) => {
    let status = "";
    Object.keys(body).forEach((key) => {
      let query = "";
      let values = [body[key], params.id];
      let data = {
        id: params.id,
      };
      if (body[key] == "1") status = "PENDING";
      if (body[key] == "2") status = "PAID";
      if (body[key] == "3") status = "DONE";
      if (body[key] == "4") status = "CANCEL";
      body["status_id"] = status;
      data[key] = body[key];
      query += `update transactions set ${key} = $1,updated_at = now() where id = $2`;
      postgreDb
        .query(query, values)
        .then((response) => {
          resolve(success(data));
        })
        .catch((err) => {
          console.log(err);
          resolve(systemError());
        });
    });
  });
};

const getTransactions = (queryParams, hostApi) => {
  return new Promise((resolve, reject) => {
    let link = `${hostApi}/api/v1/transactions?`;
    let query =
      "select tpm.transaction_id, ud.display_name, p.product_name, p.price, ct.category_name, t.tax, pm.method, d.method, d.shipping, d.minimum_distance, d.charge_cost, ps.code, ps.discount, t.notes, st.status_name, s.size, s.cost, tpm.qty, tpm.subtotal from transactions_product_sizes tpm left join transactions t on tpm.transaction_id = t.id join userdata ud on t.user_id = ud.user_id join users u on ud.user_id = u.id join products p on tpm.product_id = p.id join categories ct on p.category_id = ct.id join payments pm on t.payment_id = pm.id join status st on t.status_id = st.id  join deliveries d on t.delivery_id = d.id FULL OUTER join promos ps on t.promo_id = ps.id join sizes s on tpm.size_id = s.id";
    let queryLimit = "";
    if (queryParams.sort == "newest") {
      query += " order by t.created_at desc";
      link += `sort=${queryParams.sort}&`;
    }
    if (queryParams.sort == "oldest") {
      query += " order by t.created_at asc";
      link += `sort=${queryParams.sort}&`;
    }
    if (queryParams.sort == "pricey") {
      query += " order by tpm.subtotal desc";
      link += `sort=${queryParams.sort}&`;
    }
    if (queryParams.sort == "cheap") {
      query += " order by tpm.subtotal asc";
      link += `sort=${queryParams.sort}&`;
    }
    let values = [];
    if (queryParams.page && queryParams.limit) {
      let page = parseInt(queryParams.page);
      let limit = parseInt(queryParams.limit);
      let offset = (page - 1) * limit;
      queryLimit = query + ` limit $1 offset $2`;
      values.push(limit, offset);
    }
    postgreDb.query(query, (err, getData) => {
      if (err) {
        console.log(systemError(err.message));
        return resolve(systemError());
      }
      postgreDb.query(queryLimit, values, (err, result) => {
        if (err) {
          console.log(systemError(err.message));
          return resolve(systemError());
        }
        if (result.rows.length == 0) return resolve(notFound());
        let page = parseInt(queryParams.page);
        let limit = parseInt(queryParams.limit);
        let start = (page - 1) * limit;
        let end = page * limit;
        let next = "";
        let prev = "";
        let resNext = null;
        let resPrev = null;
        const dataNext = Math.ceil(getData.rowCount / limit);
        if (start <= getData.rowCount) {
          next = page + 1;
        }
        if (end > 0) {
          prev = page - 1;
        }
        if (parseInt(next) <= parseInt(dataNext)) {
          resNext = `${link}page=${next}&limit=${limit}`;
        }
        if (parseInt(prev) !== 0) {
          resPrev = `${link}page=${prev}&limit=${limit}`;
        }
        let sendResponse = {
          dataCount: getData.rowCount,
          next: resNext,
          prev: resPrev,
          totalPage: Math.ceil(getData.rowCount / limit),
          data: result.rows,
        };
        return resolve(success(sendResponse));
      });
    });
  });
};

// const historyTransactions = (queryParams, token) => {
//   return new Promise((resolve, reject) => {
//     let link = "http://localhost:8080/api/v1/transactions/history/:id?";
//     let query =
//       "select tpm.transaction_id, ud.display_name, p.product_name, p.price, ct.category_name, t.tax, pm.method, d.method, d.shipping, d.minimum_distance, d.charge_cost, ps.code, ps.discount, t.notes, st.status_name, s.size, s.cost, tpm.qty, tpm.subtotal from transactions_product_sizes tpm left join transactions t on tpm.transaction_id = t.id join userdata ud on t.user_id = ud.user_id join users u on ud.user_id = u.id join products p on tpm.product_id = p.id join categories ct on p.category_id = ct.id join payments pm on t.payment_id = pm.id join status st on t.status_id = st.id  join deliveries d on t.delivery_id = d.id FULL OUTER join promos ps on t.promo_id = ps.id join sizes s on tpm.size_id = s.id where u.id = $1";
//     let queryLimit = "";
//     if (queryParams.sort == "newest") {
//       query += " order by t.created_at desc";
//       link += `sort=${queryParams.sort}&`;
//     }
//     if (queryParams.sort == "oldest") {
//       query += " order by t.created_at asc";
//       link += `sort=${queryParams.sort}&`;
//     }
//     if (queryParams.sort == "pricey") {
//       query += " order by tpm.subtotal desc";
//       link += `sort=${queryParams.sort}&`;
//     }
//     if (queryParams.sort == "cheap") {
//       query += " order by tpm.subtotal asc";
//       link += `sort=${queryParams.sort}&`;
//     }
//     let values = [];
//     if (queryParams.page && queryParams.limit) {
//       let page = parseInt(queryParams.page);
//       let limit = parseInt(queryParams.limit);
//       let offset = (page - 1) * limit;
//       queryLimit = query + ` limit $2 offset $3`;
//       values.push(token.user_id, limit, offset);
//     }
//     postgreDb.query(query, [token.user_id], (err, getData) => {
//       if (err) {
//         console.log(systemError(err.message));
//         return resolve(systemError());
//       }
//       postgreDb.query(queryLimit, values, (err, result) => {
//         if (err) {
//           console.log(systemError(err.message));
//           return resolve(systemError());
//         }
//         if (result.rows.length == 0) return resolve(notFound());
//         let page = parseInt(queryParams.page);
//         let limit = parseInt(queryParams.limit);
//         let start = (page - 1) * limit;
//         let end = page * limit;
//         let next = "";
//         let prev = "";
//         let resNext = null;
//         let resPrev = null;
//         const dataNext = Math.ceil(getData.rowCount / limit);
//         if (start <= getData.rowCount) {
//           next = page + 1;
//         }
//         if (end > 0) {
//           prev = page - 1;
//         }
//         if (parseInt(next) <= parseInt(dataNext)) {
//           resNext = `${link}page=${next}&limit=${limit}`;
//         }
//         if (parseInt(prev) !== 0) {
//           resPrev = `${link}page=${prev}&limit=${limit}`;
//         }
//         let sendResponse = {
//           dataCount: getData.rowCount,
//           next: resNext,
//           prev: resPrev,
//           totalPage: Math.ceil(getData.rowCount / limit),
//           data: result.rows,
//         };
//         return resolve(success(sendResponse));
//       });
//     });
//   });
// };

const getPending = (queryParams, token) => {
  return new Promise((resolve, reject) => {
    const query =
      "select tpm.transaction_id, ud.display_name, p.product_name, p.price, ct.category_name, t.tax, pm.method, d.method, d.shipping, d.minimum_distance, d.charge_cost, ps.code, ps.discount, t.notes, st.status_name, s.size, s.cost, tpm.qty, tpm.subtotal, p.image, s.cost from transactions_product_sizes tpm left join transactions t on tpm.transaction_id = t.id join userdata ud on t.user_id = ud.user_id join users u on ud.user_id = u.id join products p on tpm.product_id = p.id join categories ct on p.category_id = ct.id join payments pm on t.payment_id = pm.id join status st on t.status_id = st.id  join deliveries d on t.delivery_id = d.id FULL OUTER join promos ps on t.promo_id = ps.id join sizes s on tpm.size_id = s.id where st.status_name = 'PENDING' AND u.id = $1";
    postgreDb.query(query, [token.user_id], (err, result) => {
      if (err) return resolve(systemError());
      resolve(success(result.rows));
    });
  });
};

const historyTransactions = (queryParams, token, hostApi) => {
  return new Promise((resolve, reject) => {
    let link = ``;
    let query = `select tpm.transaction_id, ud.display_name, p.product_name, p.price, ct.category_name, t.tax, pm.method, d.method, d.shipping, d.minimum_distance, d.charge_cost, ps.code, ps.discount, t.notes, st.status_name, s.size, s.cost, tpm.qty, tpm.subtotal, p.image from transactions_product_sizes tpm left join transactions t on tpm.transaction_id = t.id join userdata ud on t.user_id = ud.user_id join users u on ud.user_id = u.id join products p on tpm.product_id = p.id join categories ct on p.category_id = ct.id join payments pm on t.payment_id = pm.id join status st on t.status_id = st.id  join deliveries d on t.delivery_id = d.id FULL OUTER join promos ps on t.promo_id = ps.id join sizes s on tpm.size_id = s.id where u.id = $1`;
    let queryLimit = "";
    if (queryParams.sort == "newest") {
      query += " order by t.created_at desc";
      link += `sort=${queryParams.sort}&`;
    }
    if (queryParams.sort == "oldest") {
      query += " order by t.created_at asc";
      link += `sort=${queryParams.sort}&`;
    }
    if (queryParams.sort == "pricey") {
      query += " order by tpm.subtotal desc";
      link += `sort=${queryParams.sort}&`;
    }
    if (queryParams.sort == "cheap") {
      query += " order by tpm.subtotal asc";
      link += `sort=${queryParams.sort}&`;
    }
    // PAGINASI
    let values = [token.user_id];
    if (queryParams.page && queryParams.limit) {
      let page = parseInt(queryParams.page);
      let limit = parseInt(queryParams.limit);
      let offset = (page - 1) * limit;
      queryLimit = query + ` limit $2 offset $3`;
      values.push(limit, offset);
    } else {
      queryLimit = query;
    }
    postgreDb.query(query, [token.user_id], (err, getData) => {
      postgreDb.query(queryLimit, values, (err, result) => {
        if (err) {
          console.log(err);
          return resolve(systemError());
        }
        if (result.rows.length == 0) return resolve(notFound());
        let resNext = null;
        let resPrev = null;
        if (queryParams.page && queryParams.limit) {
          let page = parseInt(queryParams.page);
          let limit = parseInt(queryParams.limit);
          let start = (page - 1) * limit;
          let end = page * limit;
          let dataNext = Math.ceil(getData.rowCount / limit);
          if (start <= getData.rowCount) {
            next = page + 1;
          }
          if (end > 0) {
            prev = page - 1;
          }
          if (parseInt(next) <= parseInt(dataNext)) {
            resNext = `${link}page=${next}&limit=${limit}`;
          }
          if (parseInt(prev) !== 0) {
            resPrev = `${link}page=${prev}&limit=${limit}`;
          }
          let sendResponse = {
            dataCount: getData.rows.length,
            next: resNext,
            prev: resPrev,
            totalPage: dataNext,
            data: result.rows,
          };
          return resolve(success(sendResponse));
        }
        let sendResponse = {
          dataCount: getData.rows.length,
          next: resNext,
          prev: resPrev,
          totalPage: null,
          data: result.rows,
        };
        return resolve(success(sendResponse));
      });
    });
  });
};

const transactionsRepo = {
  transaction,
  deleteTransactions,
  editTransactions,
  getTransactions,
  historyTransactions,
  getPending,
  payment,
  // sortingHistory,
};

module.exports = transactionsRepo;
