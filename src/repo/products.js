const postgreDb = require("../config/postgre");

const createProducts = (body) => {
  return new Promise((resolve, reject) => {
    let { nameProduct, priceProduct, categoryproduct, imageProduct } = body;
    let rescategory = "";
    if (categoryproduct.toLowerCase() === "foods") rescategory = 1;
    if (categoryproduct.toLowerCase() === "coffee") rescategory = 2;
    if (categoryproduct.toLowerCase() === "non coffee") rescategory = 3;
    if (imageProduct !== "" || !imageProduct) imageProduct = null;
    const query =
      "insert into products (product_name, price, category_id, image) values ($1,$2,$3,$4) RETURNING id";
    postgreDb.query(
      query,
      [nameProduct, priceProduct, rescategory, imageProduct],
      (err, queryResult) => {
        if (err) {
          console.log(err);
          return reject(err);
        }
        const ress = {
          id: queryResult.rows[0].id,
          name: nameProduct,
          price: priceProduct,
          category: categoryproduct,
          image: imageProduct,
        };
        resolve(ress);
      }
    );
  });
};

const deleteProducts = (params) => {
  return new Promise((resolve, reject) => {
    const query = "delete from products where id = $1";
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
        query += `${key} = $${idx + 1}, updated_at = now() where id = $${
          idx + 2
        }`;
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
const getProducts = (queryParams) => {
  return new Promise((resolve, reject) => {
    let query = `select p.id, p.product_name, p.price, c.category_name, p.image from products p left join categories c on p.category_id = c.id`;
    if (queryParams.search) {
      query += ` where lower(p.product_name) like lower('%${queryParams.search}%')`;
    }
    if (queryParams.filter) {
      if (queryParams.search)
        query += ` and lower(c.category_name) like lower('%${queryParams.filter}%')`;
      query += ` where lower(c.category_name) like lower ('%${queryParams.filter}')`;
    }
    if (queryParams.sortby == "newest") {
      query += ` order by p.created_at desc`;
    }
    if (queryParams.sortby == "latest") {
      query += ` order by p.created_at asc`;
    }
    if (queryParams.price == "cheap") {
      query += ` order by p.price asc`;
    }
    if (queryParams.price == "pricey") {
      query += ` order by p.price desc`;
    }
    if (queryParams.transactions == "popular") {
      query = `select p.id, p.product_name, p.price, c.category_name, p.image, count(tpz.product_id) as sold from products p left join transactions_product_sizes tpz on p.id = tpz.product_id join categories c on p.category_id = c.id group by p.id, p.product_name, p.price, c.category_name, p.image, p.created_at order by sold desc`;
    }
    if (queryParams.transactions == "unpopular") {
      query = `select p.id, p.product_name, p.price, c.category_name, p.image, count(tpz.product_id) as sold from products p left join transactions_product_sizes tpz on p.id = tpz.product_id join categories c on p.category_id = c.id group by p.id, p.product_name, p.price, c.category_name, p.image, p.created_at order by sold asc`;
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
};

module.exports = productsRepo;
