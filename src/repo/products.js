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
const getProducts = () => {
  return new Promise((resolve, reject) => {
    const query =
      "select name_product, price, description, stock, size,category, deliv_method, start_deliv,end_deliv from products";
    postgreDb.query(query, (err, result) => {
      if (err) {
        console.log(err);
        return reject(err);
      }
      return resolve(result);
    });
  });
};

const searchProducts = (queryParams) => {
  return new Promise((resolve, reject) => {
    const query =
      "select products_id, name_product, price, description, stock, size, category,start_deliv, end_deliv from products where lower(name_product) like lower($1)";
    postgreDb.query(query, [`%${queryParams.search}%`], (err, result) => {
      if (err) {
        console.log(err);
        return reject(err);
      }
      return resolve(result);
    });
  });
};

const filterProducts = (queryParams) => {
  return new Promise((resolve, reject) => {
    const query =
      "select products_id, name_product, price, description, stock, size, category,start_deliv, end_deliv from products where lower(products.category::text) = lower($1)";
    postgreDb.query(query, [queryParams.search], (err, result) => {
      if (err) {
        console.log(err);
        return reject(err);
      }
      return resolve(result);
    });
  });
};

const sortingProducts = (queryParams) => {
  return new Promise((resolve, reject) => {
    let query =
      "select products_id, name_product, price, description, stock, size, category,start_deliv, end_deliv, create_at from products order by ";
    const values = [];
    Object.keys(queryParams).forEach((key, idx, array) => {
      if (idx === array.length - 1) {
        query += `${key} `;
        values.push(queryParams[key]);
        return;
      }
      query += `${key} , `;
      values.push(queryParams[key]);
    });
    console.log(values);
    console.log(query);
    postgreDb
      .query(query)
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

const productsRepo = {
  createProducts,
  deleteProducts,
  editProducts,
  getProducts,
  searchProducts,
  filterProducts,
  sortingProducts,
};

module.exports = productsRepo;
