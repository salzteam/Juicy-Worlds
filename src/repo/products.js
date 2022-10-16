const postgreDb = require("../config/postgre");
const response = require("../helpers/response");
const {
  success,
  notFound,
  systemError,
  created,
} = require("../helpers/templateResponse");
const deleteFile = require("../helpers/deletefile");
const client = require("../config/redis");

const createProducts = (body, file) => {
  return new Promise((resolve, reject) => {
    let { nameProduct, priceProduct, categoryproduct } = body;
    let image = "/images/" + file.filename || null;
    let rescategory = "";
    if (categoryproduct.toLowerCase() === "foods") rescategory = 1;
    if (categoryproduct.toLowerCase() === "coffee") rescategory = 2;
    if (categoryproduct.toLowerCase() === "non coffee") rescategory = 3;
    if (image == "" || !image) image = null;
    const query =
      "insert into products (product_name, price, category_id, image) values ($1,$2,$3,$4) RETURNING id";
    postgreDb.query(
      query,
      [nameProduct, priceProduct, rescategory, image],
      (err, queryResult) => {
        if (err) {
          console.log(err);
          deleteFile(file.path);
          return resolve(systemError());
        }
        const sendRespone = {
          id: queryResult.rows[0].id,
          name: nameProduct,
          price: priceProduct,
          category: categoryproduct,
          image: image,
        };
        resolve(created(sendRespone));
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
        return resolve(systemError());
      }
      resolve(success(`${result.command} transactions id ${params.id}`));
    });
  });
};

const editProducts = (body, params, file) => {
  return new Promise((resolve, reject) => {
    const { nameProduct, priceProduct, categoryproduct } = body;
    let query = "update products set ";
    const values = [];
    let imageProduct = "/images/" + file.filename || null;
    if (!nameProduct && !priceProduct && !categoryproduct) {
      if (file && file.fieldname == "image") {
        query += `displaypicture = '${imageProduct}',updated_at = now() where user_id = $1`;
        values.push(params.id);
      }
    } else {
      if (file && file.fieldname == "image") {
        query += `displaypicture = '${imageProduct}',`;
      }
    }
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
    console.log(query);
    postgreDb
      .query(query, values)
      .then((response) => {
        const sendRespon = {
          data_id: body,
          data: params.id,
          image: imageProduct,
        };
        resolve(success(sendRespon));
      })
      .catch((err) => {
        console.log(err);
        deleteFile(file.path);
        resolve(systemError());
      });
  });
};

const getProducts = (queryParams) => {
  return new Promise((resolve, reject) => {
    let link = "http://localhost:8080/api/v1/products?";
    let query = `select p.id, p.product_name, p.price, c.category_name, p.image from products p left join categories c on p.category_id = c.id`;
    let queryLimit = "";
    if (queryParams.search) {
      query += ` where lower(p.product_name) like lower('%${queryParams.search}%')`;
      link += `search=${queryParams.search}&`;
    }
    if (queryParams.filter) {
      if (queryParams.search) {
        query += ` and lower(c.category_name) like lower('%${queryParams.filter}%')`;
        link += `filter=${queryParams.filter}&`;
      }
      query += ` where lower(c.category_name) like lower ('%${queryParams.filter}%')`;
      link += `filter=${queryParams.filter}&`;
    }
    if (queryParams.sortby == "newest") {
      query += ` order by p.created_at desc`;
      link += `sortby=${queryParams.sortby}&`;
    }
    if (queryParams.sortby == "latest") {
      query += ` order by p.created_at asc`;
      link += `sortby=${queryParams.sortby}&`;
    }
    if (queryParams.price == "cheap") {
      query += ` order by p.price asc`;
      link += `price=${queryParams.price}&`;
    }
    if (queryParams.price == "pricey") {
      query += ` order by p.price desc`;
      link += `price=${queryParams.price}&`;
    }
    if (queryParams.transactions == "popular") {
      if (queryParams.filter) {
        query = `select p.id, p.product_name, p.price, c.category_name, p.image, count(tpz.product_id) as sold from products p left join transactions_product_sizes tpz on p.id = tpz.product_id join categories c on p.category_id = c.id where lower(c.category_name) like lower ('%${queryParams.filter}%') group by p.id, p.product_name, p.price, c.category_name, p.image, p.created_at order by sold desc`;
        link += `filter=${queryParams.filter}&transactions=${queryParams.transactions}&`;
      } else {
        query = `select p.id, p.product_name, p.price, c.category_name, p.image, count(tpz.product_id) as sold from products p left join transactions_product_sizes tpz on p.id = tpz.product_id join categories c on p.category_id = c.id group by p.id, p.product_name, p.price, c.category_name, p.image, p.created_at order by sold desc`;
        link += `transactions=${queryParams.transactions}&`;
      }
    }
    if (queryParams.transactions == "unpopular") {
      if (queryParams.filter) {
        query = `select p.id, p.product_name, p.price, c.category_name, p.image, count(tpz.product_id) as sold from products p left join transactions_product_sizes tpz on p.id = tpz.product_id join categories c on p.category_id = c.id where lower(c.category_name) like lower ('%${queryParams.filter}%') group by p.id, p.product_name, p.price, c.category_name, p.image, p.created_at order by sold asc`;
        link += `filter=${queryParams.filter}&transactions=${queryParams.transactions}&`;
      } else {
        query = `select p.id, p.product_name, p.price, c.category_name, p.image, count(tpz.product_id) as sold from products p left join transactions_product_sizes tpz on p.id = tpz.product_id join categories c on p.category_id = c.id group by p.id, p.product_name, p.price, c.category_name, p.image, p.created_at order by sold asc`;
        link += `transactions=${queryParams.transactions}&`;
      }
    }
    // PAGINASI
    let values = [];
    if (queryParams.page && queryParams.limit) {
      let page = parseInt(queryParams.page);
      let limit = parseInt(queryParams.limit);
      let offset = (page - 1) * limit;
      queryLimit = query + ` limit $1 offset $2`;
      values.push(limit, offset);
    }
    const datas = client.get("dataProducts").then((result) => {
      const dataValue = result;
      console.log(dataValue);
    });
    postgreDb.query(query, (err, getData) => {
      let dataProducts = JSON.stringify(getData);
      client.set(String("dataProducts"), dataProducts).then();
      postgreDb.query(queryLimit, values, (err, result) => {
        if (err) {
          console.log(err);
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

const productsRepo = {
  createProducts,
  deleteProducts,
  editProducts,
  getProducts,
};

module.exports = productsRepo;
