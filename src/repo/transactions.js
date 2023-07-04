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
        let { fee, payment, delivery, product } = body;
        const queryAddress = "SELECT adress from userdata where user_id = $1";
        client.query(queryAddress, [token.user_id], (err, resAddress) => {
          if (shouldAbort(err)) return;
          if (resAddress.rows[0].adress === "-")
            return shouldAbort({
              stack: "Please fill in the address in edit profile",
            });
          const queryText =
            "insert into transactions (user_id, tax, payment_id, delivery_id, address) values ($1,$2,$3,$4,$5) RETURNING id";
          client.query(
            queryText,
            [token.user_id, fee, payment, delivery, resAddress.rows[0].adress],
            (err, res) => {
              if (shouldAbort(err)) return;
              const insertPivot =
                "insert into transactions_product_sizes (transaction_id, product_id, size_id, qty, promo_id, subtotal) values ($1,$2,$3,$4,$5,$6)";
              const valuUser = res.rows[0].id;
              const productArray = new Function("return" + product + "")();
              productArray.forEach((product, index) => {
                if (index !== productArray.length - 1) {
                  client.query(
                    insertPivot,
                    [
                      valuUser,
                      product.product_id,
                      product.size_id,
                      product.qty,
                      product.promo_id,
                      product.subtotal,
                    ],
                    (err, res) => {
                      if (shouldAbort(err)) return;
                    }
                  );
                }
                if (index === productArray.length - 1) {
                  client.query(
                    insertPivot,
                    [
                      valuUser,
                      product.product_id,
                      product.size_id,
                      product.qty,
                      product.promo_id,
                      product.subtotal,
                    ],
                    (err, res) => {
                      if (shouldAbort(err)) return;
                      client.query("COMMIT", (err) => {
                        if (err) {
                          console.error(
                            "Error committing transaction",
                            err.stack
                          );
                          resolve(systemError());
                        }
                      });
                      resolve(success("Created!"));
                    }
                  );
                }
              });
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
    console.log(params);
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

const paymentMidtrans = (status, transaction_id) => {
  return new Promise((resolve) => {
    console.log(status);
    console.log(transaction_id);
    let query = `update transactions set status_id = $1, updated_at = now() where id = $2`;
    postgreDb
      .query(query, [status, transaction_id])
      .then((response) => {
        console.log(response);
        resolve(success(response.rows[0]));
      })
      .catch((err) => {
        console.log(err);
        resolve(systemError());
      });
  });
};
const getTransactions = (queryParams, hostApi) => {
  return new Promise((resolve, reject) => {
    let link = ``;
    let query =
      "select tpm.transaction_id, ud.display_name, p.product_name, p.image, p.price, ct.category_name, t.tax, pm.method as mPayment, d.method, d.shipping, d.minimum_distance, d.charge_cost, ps.code, ps.discount,  st.status_name, s.size, s.cost, tpm.qty, tpm.subtotal from transactions_product_sizes tpm left join transactions t on tpm.transaction_id = t.id join userdata ud on t.user_id = ud.user_id join users u on ud.user_id = u.id join products p on tpm.product_id = p.id join categories ct on p.category_id = ct.id join payments pm on t.payment_id = pm.id join status st on t.status_id = st.id  join deliveries d on t.delivery_id = d.id FULL OUTER join promos ps on tpm.promo_id = ps.id join sizes s on tpm.size_id = s.id  where  st.status_name != 'CANCEL' and pm.method != 'none'";
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
      let Counts = 0;
      getData.rows.forEach((item, index) => {
        if (
          (item.mpayment === "Bank Account" && item.status_name === "PAID") ||
          (item.mpayment === "Card" && item.status_name === "PAID") ||
          (item.mpayment === "Cash On Delivery" &&
            item.status_name === "PENDING")
        ) {
          Counts += 1;
        }
      });
      postgreDb.query(query, (err, result) => {
        if (err) {
          console.log(systemError(err.message));
          return resolve(systemError());
        }
        if (result.rows.length == 0) return resolve(notFound());
        let newData = [];
        result.rows.forEach((item) => {
          if (
            (item.mpayment === "Bank Account" && item.status_name === "PAID") ||
            (item.mpayment === "Card" && item.status_name === "PAID") ||
            (item.mpayment === "Cash On Delivery" &&
              item.status_name === "PENDING")
          ) {
            if (item.discount !== 0) {
              let newItem = {
                ...item,
                price: (parseInt(item.discount) / 100) * parseInt(item.price),
              };
              newData.push(newItem);
            }
            if (item.discount === 0) {
              newData.push(item);
            }
          }
        });
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
          dataCount: Counts,
          next: null,
          prev: resPrev,
          totalPage: Math.ceil(Counts / limit),
          data: newData,
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
    const query = `select tpm.transaction_id, ud.display_name, p.product_name, p.price, ct.category_name, t.tax, pm.method, d.method, d.shipping, d.minimum_distance, d.charge_cost, ps.code, ps.discount, st.status_name, s.size, s.cost, tpm.qty, tpm.subtotal, p.image, s.cost from transactions_product_sizes tpm 
      left join transactions t on tpm.transaction_id = t.id 
      join userdata ud on t.user_id = ud.user_id 
      join users u on ud.user_id = u.id 
      join products p on tpm.product_id = p.id 
      join categories ct on p.category_id = ct.id 
      join payments pm on t.payment_id = pm.id 
      join status st on t.status_id = st.id  
      join deliveries d on t.delivery_id = d.id 
      FULL OUTER join promos ps on tpm.promo_id = ps.id join sizes s on tpm.size_id = s.id where st.status_name = 'PENDING' AND u.id = $1`;
    postgreDb.query(query, [token.user_id], (err, result) => {
      if (err) {
        console.log(err);
        return resolve(systemError());
      }
      resolve(success(result.rows));
    });
  });
};

const setAll = () => {
  return new Promise((resolve) => {
    const queryCod =
      "select tpm.transaction_id, ud.display_name, p.product_name, p.image, p.price, ct.category_name, t.tax, pm.method as mPayment, d.method, d.shipping, d.minimum_distance, d.charge_cost, ps.code, ps.discount, t.notes, st.status_name, s.size, s.cost, tpm.qty, tpm.subtotal from transactions_product_sizes tpm left join transactions t on tpm.transaction_id = t.id join userdata ud on t.user_id = ud.user_id join users u on ud.user_id = u.id join products p on tpm.product_id = p.id join categories ct on p.category_id = ct.id join payments pm on t.payment_id = pm.id join status st on t.status_id = st.id  join deliveries d on t.delivery_id = d.id FULL OUTER join promos ps on t.promo_id = ps.id join sizes s on tpm.size_id = s.id  where st.status_name = 'PENDING' and pm.method = 'Cash On Delivery'";
    const queryCard =
      "select tpm.transaction_id, ud.display_name, p.product_name, p.image, p.price, ct.category_name, t.tax, pm.method as mPayment, d.method, d.shipping, d.minimum_distance, d.charge_cost, ps.code, ps.discount, t.notes, st.status_name, s.size, s.cost, tpm.qty, tpm.subtotal from transactions_product_sizes tpm left join transactions t on tpm.transaction_id = t.id join userdata ud on t.user_id = ud.user_id join users u on ud.user_id = u.id join products p on tpm.product_id = p.id join categories ct on p.category_id = ct.id join payments pm on t.payment_id = pm.id join status st on t.status_id = st.id  join deliveries d on t.delivery_id = d.id FULL OUTER join promos ps on t.promo_id = ps.id join sizes s on tpm.size_id = s.id  where st.status_name = 'PAID' and pm.method = 'Card'";
    const queryBank =
      "select tpm.transaction_id, ud.display_name, p.product_name, p.image, p.price, ct.category_name, t.tax, pm.method as mPayment, d.method, d.shipping, d.minimum_distance, d.charge_cost, ps.code, ps.discount, t.notes, st.status_name, s.size, s.cost, tpm.qty, tpm.subtotal from transactions_product_sizes tpm left join transactions t on tpm.transaction_id = t.id join userdata ud on t.user_id = ud.user_id join users u on ud.user_id = u.id join products p on tpm.product_id = p.id join categories ct on p.category_id = ct.id join payments pm on t.payment_id = pm.id join status st on t.status_id = st.id  join deliveries d on t.delivery_id = d.id FULL OUTER join promos ps on t.promo_id = ps.id join sizes s on tpm.size_id = s.id  where st.status_name = 'PAID' and pm.method = 'Bank Account'";
    postgreDb.query(queryCod, (err, resultCod) => {
      if (err) {
        console.log(err);
        return resolve(systemError());
      }
      if (resultCod.rows.length !== 0) {
        let changeStatus =
          "update transactions set status_id = $1,updated_at = now() where id = $2";
        resultCod.rows.forEach((item) => {
          postgreDb.query(
            changeStatus,
            ["3", item.transaction_id],
            (errs, _) => {
              if (errs) return resolve(systemError());
            }
          );
        });
      }
      postgreDb.query(queryCard, (errCard, resultCard) => {
        if (errCard) {
          console.log(errCard);
          return resolve(systemError());
        }
        if (resultCard.rows.length !== 0) {
          let changeStatus =
            "update transactions set status_id = $1,updated_at = now() where id = $2";
          resultCard.rows.forEach((item) => {
            postgreDb.query(
              changeStatus,
              ["3", item.transaction_id],
              (errs, _) => {
                if (errs) return resolve(systemError());
              }
            );
          });
        }
        postgreDb.query(queryBank, (errBank, resultBank) => {
          if (errBank) {
            console.log(errBank);
            return resolve(systemError());
          }
          if (resultBank.rows.length !== 0) {
            let changeStatus =
              "update transactions set status_id = $1,updated_at = now() where id = $2";
            resultBank.rows.forEach((item) => {
              postgreDb.query(
                changeStatus,
                ["3", item.transaction_id],
                (errs, _) => {
                  if (errs) {
                    console.log(errs);
                    return resolve(systemError());
                  }
                }
              );
            });
          }
        });
        resolve(success("Suksess"));
      });
    });
  });
};

const historyTransactions = (queryParams, token, hostApi) => {
  return new Promise((resolve, reject) => {
    let link = ``;
    let query = `select tpm.transaction_id, ud.display_name, p.product_name, p.price, ct.category_name, t.tax, pm.method, d.method, d.shipping, d.minimum_distance, d.charge_cost, ps.code,
    ps.discount, st.status_name, s.size, s.cost, tpm.qty, tpm.subtotal, p.image from transactions_product_sizes tpm
    left join transactions t on tpm.transaction_id = t.id join userdata ud on t.user_id = ud.user_id join users u on ud.user_id = u.id
    join products p on tpm.product_id = p.id join categories ct on p.category_id = ct.id join payments pm on t.payment_id = pm.id
    join status st on t.status_id = st.id  join deliveries d on t.delivery_id = d.id FULL OUTER join promos ps on tpm.promo_id = ps.id
    join sizes s on tpm.size_id = s.id where u.id = $1`;
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
        let dataResponse = [];
        result.rows.forEach((data) => {
          let price = data.price;
          if (data.discount)
            price = (parseInt(data.discount) / 100) * parseInt(data.price);
          const newData = {
            transaction_id: data.transaction_id,
            display_name: data.display_name,
            product_name: data.product_name,
            price: price,
            normal_price: data.price,
            category_name: data.category_name,
            tax: data.tax,
            method: data.method,
            shipping: data.shipping,
            minimum_distance: data.minimum_distance,
            charge_cost: data.charge_cost,
            code: data.code,
            discount: data.discount,
            status_name: data.status_name,
            size: data.size,
            cost: data.cost,
            qty: data.qty,
            subtotal: data.subtotal,
            image: data.image,
          };
          dataResponse.push(newData);
        });
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
            data: dataResponse,
          };
          return resolve(success(sendResponse));
        }
        let sendResponse = {
          dataCount: getData.rows.length,
          next: resNext,
          prev: resPrev,
          totalPage: null,
          data: dataResponse,
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
  paymentMidtrans,
  setAll,
};

module.exports = transactionsRepo;
