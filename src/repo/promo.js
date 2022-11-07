const response = require("../helpers/response");
const {
  success,
  notFound,
  systemError,
  created,
} = require("../helpers/templateResponse");
const postgreDb = require("../config/postgre");

// const createPromo = (body) => {
//   return new Promise((resolve, reject) => {
//     let { code, discount, product_id, image } = body;
//     const query =
//       "insert into promos (code, discount, product_id) values ($1,$2,$3) RETURNING id";
//     postgreDb.query(query, [code, discount, product_id], (err, queryResult) => {
//       if (err) {
//         console.log(err);
//         return resolve(systemError());
//       }
//       resolve(
//         created({
//           id: queryResult.rows[0].id,
//           code: code,
//           discount: discount + "%",
//           product_id: product_id,
//         })
//       );
//     });
//   });
// };

const createPromo = (body, file) => {
  return new Promise((resolve, reject) => {
    let { code, discount, product_id, start, end, color, title, desc } = body;
    let image = null;
    if (file) {
      image = file.url;
    }
    console.log(desc);
    const query =
      "insert into promos (code, discount, product_id, description, imagepp, bgcolor, title, start, endexp) values ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id";
    postgreDb.query(
      query,
      [code, discount, product_id, desc, image, color, title, start, end],
      (err, queryResult) => {
        if (err) {
          console.log(err);
          return resolve(systemError());
        }
        resolve(
          created({
            id: queryResult.rows[0].id,
            Product_id: product_id,
            Title: title,
            Code: code,
            Discount: discount,
            Description: desc,
            Color: color,
            Start: start,
            End: end,
            Image: image,
          })
        );
      }
    );
  });
};

const deletePromo = (params) => {
  return new Promise((resolve, reject) => {
    const query = "delete from promos where id = $1";
    postgreDb.query(query, [params.id], (err, result) => {
      if (err) {
        console.log(err);
        return resolve(systemError());
      }
      resolve(success(`${result.command} promo id ${params.id}`));
    });
  });
};
const editPromo = (body, params) => {
  return new Promise((resolve, reject) => {
    console.log(body);
    console.log(params);
    let query = "update promos set ";
    const values = [];
    let data = {
      id: params.id,
    };
    Object.keys(body).forEach((key, idx, array) => {
      if (idx === array.length - 1) {
        query += `${key} = $${idx + 1}, updated_at = now() where id = $${
          idx + 2
        }`;
        values.push(body[key], params.id);
        data[key] = body[key];
        return;
      }
      query += `${key} = $${idx + 1},`;
      values.push(body[key]);
      data[key] = body[key];
    });
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
};
// const getPromo = (Params) => {
//   return new Promise((resolve, reject) => {
//     let link = `${port_paginasi}api/v1/promo?`;
//     let query = `select pr.code, pr.discount, p.product_name, p.price, c.category_name from promos pr left join products p on pr.product_id = p.id join categories c on p.category_id = c.id`;
//     let queryLimit = "";
//     if (Params.search) {
//       query += ` where lower(p.product_name) like lower('%${Params.search}%')`;
//       link += `search=${Params.search}&`;
//     }
//     // PAGINASI
//     let values = [];
//     if (Params.page && Params.limit) {
//       let page = parseInt(Params.page);
//       let limit = parseInt(Params.limit);
//       let offset = (page - 1) * limit;
//       queryLimit = query + ` limit $1 offset $2`;
//       values.push(limit, offset);
//     }
//     postgreDb.query(query, (err, getData) => {
//       postgreDb.query(queryLimit, values, (err, result) => {
//         if (err) {
//           console.log(err);
//           return resolve(systemError());
//         }
//         if (result.rows.length == 0) return resolve(notFound());
//         for (let i = 0; i < result.rows.length; i++) {
//           const priceDisc =
//             (result.rows[i].discount / 100) * result.rows[i].price;
//           const Finalprice = result.rows[i].price - priceDisc;
//           result.rows[i].price = Finalprice;
//         }
//         let page = parseInt(Params.page);
//         let limit = parseInt(Params.limit);
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

const getPromo = (queryParams, hostApi) => {
  return new Promise((resolve, reject) => {
    let link = `${hostApi}/api/v1/promo?`;
    let query = `select pr.code, pr.*, p.id,p.product_name, p.price, c.category_name, p.image from promos pr left join products p on pr.product_id = p.id join categories c on p.category_id = c.id`;
    let queryLimit = "";
    if (queryParams.search) {
      query += ` where lower(p.product_name) like lower('%${queryParams.search}%')`;
      link += `search=${queryParams.search}&`;
    }
    // PAGINASI
    let values = [];
    if (queryParams.page && queryParams.limit) {
      let page = parseInt(queryParams.page);
      let limit = parseInt(queryParams.limit);
      let offset = (page - 1) * limit;
      queryLimit = query + ` limit $1 offset $2`;
      values.push(limit, offset);
    } else {
      queryLimit = query;
    }
    postgreDb.query(query, (err, getData) => {
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
const promoRepo = {
  createPromo,
  deletePromo,
  editPromo,
  getPromo,
};

module.exports = promoRepo;
