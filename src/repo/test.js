const postgreDb = require("../config/postgre");

const createProducts = (body) => {
  return new Promise((resolve, reject) => {
    const query =
      "insert into products (name_product, price, description,stock,size,deliv_method,start_deliv,end_deliv,category) values ($1,$2,$3,$4,$5,$6,$7,$8,$9)";
    const {
      name_product,
      price,
      description,
      stock,
      size,
      deliv_method,
      start_deliv,
      end_deliv,
      category,
    } = body;
    postgreDb.query(
      query,
      [
        name_product,
        price,
        description,
        stock,
        size,
        deliv_method,
        start_deliv,
        end_deliv,
        category,
      ],
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

const deleteProducts = (params) => {
  return new Promise((resolve, reject) => {
    const query = "delete from products where products_id = $1";
    postgreDb.query(query, [params.id], (err, result) => {
      if (err) {
        console.log(err);
        return reject(err);
      }
      resolve(result);
    });
  });
};
const editProducts = (body, params) => {
  return new Promise((resolve, reject) => {
    let query = "update products set ";
    const values = [];
    Object.keys(body).forEach((key, idx, array) => {
      if (idx === array.length - 1) {
        query += `${key} = $${
          idx + 1
        }, update_at = now() where products_id = $${idx + 2}`;
        values.push(body[key], params.id);
        return;
      }
      query += `${key} = $${idx + 1},`;
      values.push(body[key]);
    });
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
const getProducts = (queryParams) => {
  return new Promise((resolve, reject) => {
    const query1 =
      "select name_product, price, description, stock, size,category, deliv_method, start_deliv,end_deliv from products";
    const query2 =
      "select products_id, name_product, price, description, stock, size, category,start_deliv, end_deliv from products where lower(name_product) like lower($1)";
    if (queryParams.length < 0) {
      postgreDb.query(query1, (err, result) => {
        if (err) {
          console.log(err);
          return reject(err);
        }
        return resolve(result);
      });
    }
    postgreDb.query(query2, [`%${queryParams.name}%`], (err, result) => {
      if (err) {
        console.log(err);
        return reject(err);
      }
      return resolve(result);
    });
  });
};

const productsRepo = {
  createProducts,
  deleteProducts,
  editProducts,
  getProducts,
};

module.exports = productsRepo;
