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
    const ress = [
      name_product,
      price,
      description,
      stock,
      size,
      deliv_method,
      start_deliv,
      end_deliv,
      category,
    ];
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
        resolve(ress);
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
        resolve([body, params.id]);
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
      "select products_id, name_product, price, description, stock, size,category, deliv_method, start_deliv,end_deliv from products";
    postgreDb.query(query, (err, result) => {
      if (err) {
        console.log(err);
        return reject(err);
      }
      if (result.rows.length == 0) return reject(404);
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
      if (result.rows.length == 0) return reject(404);
      return resolve(result);
    });
  });
};

const filterProducts = (queryParams) => {
  return new Promise((resolve, reject) => {
    let query =
      "select products_id, name_product, price, description, stock, size, category,deliv_method,start_deliv, end_deliv from products where ";
    const values = [];
    Object.keys(queryParams).forEach((key) => {
      query += `lower(products.${key}::text) = lower($1)`;
      values.push(queryParams[key]);
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

const sortingProducts = (queryParams) => {
  return new Promise((resolve, reject) => {
    let query = `select products_id, name_product, price, description, stock, size, category,start_deliv, end_deliv, create_at from products order by `;
    if (queryParams.orderby == "price") {
      query += `price `;
    }
    if (queryParams.orderby == "create_at") {
      query += `create_at `;
    }
    if (queryParams.orderby == "transactions") {
      query = `select p.products_id, p.name_product, p.price, p.description, p.stock, p.size, p.category, p.start_deliv, p.end_deliv, p.create_at, count(t.product_id) as count from products p left join transactions t on p.products_id = t.product_id group by p.products_id, p.name_product, p.price, p.description, p.stock, p.size, p.category, p.start_deliv, p.end_deliv, p.create_at order by count  `;
    }
    if (queryParams.sort == "asc") {
      query += `asc`;
    }
    if (queryParams.sort == "desc") {
      query += `descc`;
    }
    postgreDb.query(query, (err, result) => {
      if (err) {
        console.log(err);
        return reject(err);
      }
      if (result.rows.length == 0) return reject(404);
      return resolve(result);
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
