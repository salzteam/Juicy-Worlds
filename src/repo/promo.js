const postgreDb = require("../config/postgre");

const createPromo = (body) => {
  return new Promise((resolve, reject) => {
    let { code, discount, product_id } = body;
    const query =
      "insert into promos (code, discount, product_id) values ($1,$2,$3) RETURNING id";
    postgreDb.query(query, [code, discount, product_id], (err, queryResult) => {
      if (err) {
        console.log(err);
        return reject(err);
      }
      const ress = {
        id: queryResult.rows[0].id,
        code: code,
        discount: discount + "%",
        product_id: product_id,
      };
      resolve(ress);
    });
  });
};

const deletePromo = (params) => {
  return new Promise((resolve, reject) => {
    const query = "delete from promos where id = $1";
    postgreDb.query(query, [params.id], (err, result) => {
      if (err) {
        console.log(err);
        return reject(err);
      }
      resolve(result);
    });
  });
};
const editPromo = (body, params) => {
  return new Promise((resolve, reject) => {
    let query = "update promos set ";
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
const getPromo = (queryParams) => {
  return new Promise((resolve, reject) => {
    let query = `select pr.code, pr.discount, p.product_name, p.price, c.category_name from promos pr left join products p on pr.product_id = p.id join categories c on p.category_id = c.id`;
    if (queryParams.search) {
      query += ` where lower(p.product_name) like lower('%${queryParams.search}%')`;
    }
    postgreDb.query(query, (err, result) => {
      if (err) {
        console.log(err);
        return reject(err);
      }
      if (result.rows.length == 0) return reject(404);
      for (let i = 0; i < result.rows.length; i++) {
        const priceDisc =
          (result.rows[i].discount / 100) * result.rows[i].price;
        const Finalprice = result.rows[i].price - priceDisc;
        result.rows[i].price = Finalprice;
      }
      return resolve(result);
    });
  });
};
const promoRepo = {
  createPromo,
  deletePromo,
  editPromo,
  getPromo,
};

module.exports = promoRepo;
