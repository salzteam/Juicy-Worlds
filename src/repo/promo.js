const postgreDb = require("../config/postgre");

const createPromo = (body) => {
  return new Promise((resolve, reject) => {
    const query =
      "insert into promo (couponcode, discname, description, free, startdate, enddate, product_id, size) values ($1,$2,$3,$4,$5,$6,$7,$8)";
    const {
      couponcode,
      discname,
      description,
      free,
      startdate,
      enddate,
      product_id,
      size,
    } = body;
    const ress = {
      Coupon_Code: couponcode,
      Discont_Name: discname,
      Description: description,
      Free: free,
      Start: startdate,
      Expired: enddate,
      Product: product_id,
      Size: size,
    };
    postgreDb.query(
      query,
      [
        couponcode,
        discname,
        description,
        free,
        startdate,
        enddate,
        product_id,
        size,
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

const deletePromo = (params) => {
  return new Promise((resolve, reject) => {
    const query = "delete from promo where promo_id = $1";
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
    let query = "update promo set ";
    const values = [];
    Object.keys(body).forEach((key, idx, array) => {
      if (idx === array.length - 1) {
        query += `${key} = $${idx + 1}, update_at = now() where promo_id = $${
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
const getPromo = () => {
  return new Promise((resolve, reject) => {
    const query =
      "select promo_id, couponcode, discname, description, free, size, startdate, enddate from promo";
    postgreDb.query(query, (err, result) => {
      if (err) {
        console.log(err);
        return reject(err);
      }
      return resolve(result);
    });
  });
};
const searchPromo = (queryParams) => {
  return new Promise((resolve, reject) => {
    const query =
      "select p.promo_id, p.couponcode, p.discname, p.description, pr.name_product,pr.price,pr.description,pr.category,p.free, startdate, enddate from promo p join products pr on p.product_id = pr.products_id where lower(discname) like lower($1)";
    postgreDb.query(query, [`%${queryParams.couponcode}%`], (err, result) => {
      if (err) {
        console.log(err);
        return reject(err);
      }
      if (result.rows.length == 0) return reject(404);
      return resolve(result);
    });
  });
};
const promoRepo = {
  createPromo,
  deletePromo,
  editPromo,
  getPromo,
  searchPromo,
};

module.exports = promoRepo;
