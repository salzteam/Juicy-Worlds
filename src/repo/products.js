const response = require("../helpers/response");
const {
  success,
  notFound,
  systemError,
  created,
} = require("../helpers/templateResponse");
const deleteFile = require("../helpers/deletefile");
const postgreDb = require("../config/postgre");

const createProducts = (body, file) => {
  return new Promise((resolve, reject) => {
    let { nameProduct, priceProduct, categoryproduct, description } = body;
    let image = null;
    if (file) {
      image = file.url;
    }
    let rescategory = "";
    if (categoryproduct.toLowerCase() === "foods") rescategory = 1;
    if (categoryproduct.toLowerCase() === "coffee") rescategory = 2;
    if (categoryproduct.toLowerCase() === "non coffee") rescategory = 3;
    if (categoryproduct.toLowerCase() === "mix snack") rescategory = 4;
    const query =
      "insert into products (product_name, price, category_id, image, description) values ($1,$2,$3,$4,$5) RETURNING id";
    postgreDb.query(
      query,
      [nameProduct, priceProduct, rescategory, image, description],
      (err, queryResult) => {
        if (err) {
          console.log(err);
          if (file) {
            deleteFile(file.path);
          }
          return resolve(systemError());
        }
        resolve(
          created({
            id: queryResult.rows[0].id,
            name: nameProduct,
            price: priceProduct,
            category: categoryproduct,
            description: description,
            image: image,
          })
        );
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
const getbyid = (params) => {
  return new Promise((resolve, reject) => {
    const query =
      "select p.id, p.product_name, p.price, c.category_name, p.image, p.description from products p left join categories c on p.category_id = c.id where p.id = $1";
    postgreDb.query(query, [params.id], (err, result) => {
      postgreDb.query(
        "select * from promos where product_id = $1",
        [params.id],
        (err, resultpromos) => {
          if (err) {
            console.log(err);
            return resolve(systemError());
          }
          let dataPromo = 999;
          if (resultpromos.rows.length > 0) dataPromo = resultpromos.rows[0];
          const Response = {
            dataProduct: result.rows["0"],
            dataPromo: dataPromo,
          };
          console.log(result.rows);
          resolve(success(Response));
        }
      );
    });
  });
};

const editProducts = (body, params, file) => {
  return new Promise((resolve, reject) => {
    const { product_name, price, category_id, description } = body;
    let query = "update products set ";
    const values = [];
    let imageProduct = "";
    let data = {
      id: params.id,
    };
    if (file) {
      imageProduct = file.url;
      if (!product_name && !price && !category_id) {
        if (file && file.resource_type == "image") {
          query += `image = '${imageProduct}',updated_at = now() where id = $1`;
          values.push(params.id);
          data["image"] = imageProduct;
        }
      } else {
        if (file && file.resource_type == "image") {
          query += `image = '${imageProduct}',`;
          data["image"] = imageProduct;
        }
      }
    }
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
      data[key] = body[key];
      values.push(body[key]);
    });
    postgreDb
      .query(query, values)
      .then((response) => {
        if (file) {
          return resolve(success(data));
        } else {
          return resolve(success(data));
        }
      })
      .catch((err) => {
        console.log(err);
        if (file) {
          deleteFile(file.path);
        }
        resolve(systemError());
      });
  });
};

const getProducts = (queryParams, hostApi) => {
  return new Promise((resolve, reject) => {
    let link = `${hostApi}/api/v1/products?`;
    let query = `select p.id, p.product_name, p.price, c.category_name, p.image, p.description from products p left join categories c on p.category_id = c.id`;
    let querPopular = `select p.id, p.product_name, p.price, c.category_name, p.image, COALESCE(sum(tpz.qty),0) as sold from products p left join transactions_product_sizes tpz on p.id = tpz.product_id join categories c on p.category_id = c.id group by p.id, p.product_name, p.price, c.category_name, p.image, p.created_at order by sold desc`;
    let queryLimit = "";
    if (queryParams.search && !queryParams.filter) {
      query += ` where lower(p.product_name) like lower('%${queryParams.search}%')`;
      link += `search=${queryParams.search}&`;
    }
    if (queryParams.filter && queryParams.search) {
      query += ` where lower(p.product_name) like lower('%${queryParams.search}%') and lower(c.category_name) like lower('${queryParams.filter}')`;
      link += `filter=${queryParams.filter}&`;
    }
    if (queryParams.filter && !queryParams.search) {
      query += ` where lower(c.category_name) like lower ('${queryParams.filter}')`;
      link += `filter=${queryParams.filter}&`;
    }
    // if (queryParams.filter) {
    //   if (queryParams.search) {
    //     query += ` and lower(c.category_name) like lower('${queryParams.filter}')`;
    //     link += `filter=${queryParams.filter}&`;
    //   }
    //   query += ` where lower(c.category_name) like lower ('${queryParams.filter}')`;
    //   link += `filter=${queryParams.filter}&`;
    // }
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
      if (queryParams.transactions && queryParams.search) {
        if (queryParams.transactions && queryParams.price == "cheap") {
          if (queryParams.transactions && queryParams.sortby == "newest") {
            querPopular += `select p.id, p.product_name, p.price, c.category_name, p.image, COALESCE(sum(tpz.qty),0) as sold from products p left join transactions_product_sizes tpz on p.id = tpz.product_id join categories c on p.category_id = c.id
            where lower(p.product_name) like lower('%${queryParams.search}%') group by p.id, p.product_name, p.price, c.category_name, p.image, p.created_at order by sold desc, p.price asc,p.created_at desc`;
            link += `sortby=${queryParams.sortby}&`;
          }
          if (queryParams.transactions && queryParams.sortby == "latest") {
            querPopular += `select p.id, p.product_name, p.price, c.category_name, p.image, COALESCE(sum(tpz.qty),0) as sold from products p left join transactions_product_sizes tpz on p.id = tpz.product_id join categories c on p.category_id = c.id
            where lower(p.product_name) like lower('%${queryParams.search}%') group by p.id, p.product_name, p.price, c.category_name, p.image, p.created_at order by sold desc, p.price asc, p.created_at asc`;
            link += `sortby=${queryParams.sortby}&`;
          }
          querPopular += `select p.id, p.product_name, p.price, c.category_name, p.image, COALESCE(sum(tpz.qty),0) as sold from products p left join transactions_product_sizes tpz on p.id = tpz.product_id join categories c on p.category_id = c.id
          where lower(p.product_name) like lower('%${queryParams.search}%') group by p.id, p.product_name, p.price, c.category_name, p.image, p.created_at order by sold desc, p.price asc`;
          link += `price=${queryParams.price}&`;
        }
        if (queryParams.transactions && queryParams.price == "pricey") {
          if (queryParams.transactions && queryParams.sortby == "newest") {
            querPopular += `select p.id, p.product_name, p.price, c.category_name, p.image, COALESCE(sum(tpz.qty),0) as sold from products p left join transactions_product_sizes tpz on p.id = tpz.product_id join categories c on p.category_id = c.id
            where lower(p.product_name) like lower('%${queryParams.search}%') group by p.id, p.product_name, p.price, c.category_name, p.image, p.created_at order by sold desc, p.price desc,p.created_at desc`;
            link += `sortby=${queryParams.sortby}&`;
          }
          if (queryParams.transactions && queryParams.sortby == "latest") {
            querPopular += `select p.id, p.product_name, p.price, c.category_name, p.image, COALESCE(sum(tpz.qty),0) as sold from products p left join transactions_product_sizes tpz on p.id = tpz.product_id join categories c on p.category_id = c.id
            where lower(p.product_name) like lower('%${queryParams.search}%') group by p.id, p.product_name, p.price, c.category_name, p.image, p.created_at order by sold desc, p.price desc, p.created_at asc`;
            link += `sortby=${queryParams.sortby}&`;
          }
          querPopular += `select p.id, p.product_name, p.price, c.category_name, p.image, COALESCE(sum(tpz.qty),0) as sold from products p left join transactions_product_sizes tpz on p.id = tpz.product_id join categories c on p.category_id = c.id
          where lower(p.product_name) like lower('%${queryParams.search}%') group by p.id, p.product_name, p.price, c.category_name, p.image, p.created_at order by sold desc, p.price desc`;
          link += `price=${queryParams.price}&`;
        }
        if (queryParams.transactions && queryParams.sortby == "newest") {
          querPopular += `select p.id, p.product_name, p.price, c.category_name, p.image, COALESCE(sum(tpz.qty),0) as sold from products p left join transactions_product_sizes tpz on p.id = tpz.product_id join categories c on p.category_id = c.id
          where lower(p.product_name) like lower('%${queryParams.search}%') group by p.id, p.product_name, p.price, c.category_name, p.image, p.created_at order by sold desc, p.created_at desc`;
          link += `sortby=${queryParams.sortby}&`;
        }
        if (queryParams.transactions && queryParams.sortby == "latest") {
          querPopular += `select p.id, p.product_name, p.price, c.category_name, p.image, COALESCE(sum(tpz.qty),0) as sold from products p left join transactions_product_sizes tpz on p.id = tpz.product_id join categories c on p.category_id = c.id
          where lower(p.product_name) like lower('%${queryParams.search}%') group by p.id, p.product_name, p.price, c.category_name, p.image, p.created_at order by sold desc, p.created_at asc`;
          link += `sortby=${queryParams.sortby}&`;
        }
        querPopular = `select p.id, p.product_name, p.price, c.category_name, p.image, COALESCE(sum(tpz.qty),0) as sold from products p left join transactions_product_sizes tpz on p.id = tpz.product_id join categories c on p.category_id = c.id
        where lower(p.product_name) like lower('%${queryParams.search}%') group by p.id, p.product_name, p.price, c.category_name, p.image, p.created_at order by sold desc`;
        link += `search=${queryParams.search}&`;
      }
      if (queryParams.transactions && queryParams.filter) {
        if (queryParams.transactions && queryParams.search) {
          querPopular = `select p.id, p.product_name, p.price, c.category_name, p.image, COALESCE(sum(tpz.qty),0) as sold from products p left join transactions_product_sizes tpz on p.id = tpz.product_id join categories c on p.category_id = c.id
          where lower(p.product_name) like lower('%${queryParams.search}%') and lower(c.category_name) like lower('${queryParams.filter}') group by p.id, p.product_name, p.price, c.category_name, p.image, p.created_at order by sold desc`;
          link += `search=${queryParams.search}&`;
        }
        querPopular = `select p.id, p.product_name, p.price, c.category_name, p.image, COALESCE(sum(tpz.qty),0) as sold from products p left join transactions_product_sizes tpz on p.id = tpz.product_id join categories c on p.category_id = c.id where lower(c.category_name) like lower ('%${queryParams.filter}%') group by p.id, p.product_name, p.price, c.category_name, p.image, p.created_at order by sold desc`;
        link += `filter=${queryParams.filter}&transactions=${queryParams.transactions}&`;
      }
      if (queryParams.price == "cheap") {
        querPopular += `, p.price asc`;
        link += `price=${queryParams.price}&`;
      }
      if (queryParams.price == "pricey") {
        querPopular += `, p.price desc`;
        link += `price=${queryParams.price}&`;
      }
      if (queryParams.sortby == "newest") {
        querPopular += `, p.created_at desc`;
        link += `sortby=${queryParams.sortby}&`;
      }
      if (queryParams.sortby == "latest") {
        querPopular += `,  p.created_at asc`;
        link += `sortby=${queryParams.sortby}&`;
      } else {
        link += `transactions=${queryParams.transactions}&`;
      }
    }
    if (queryParams.transactions == "unpopular") {
      if (queryParams.filter) {
        query = `select p.id, p.product_name, p.price, c.category_name, p.image, COALESCE(sum(tpz.qty),0) as sold from products p left join transactions_product_sizes tpz on p.id = tpz.product_id join categories c on p.category_id = c.id where lower(c.category_name) like lower ('%${queryParams.filter}%') group by p.id, p.product_name, p.price, c.category_name, p.image, p.created_at order by sold asc`;
        link += `filter=${queryParams.filter}&transactions=${queryParams.transactions}&`;
      } else {
        query = `select p.id, p.product_name, p.price, c.category_name, p.image, COALESCE(sum(tpz.qty),0) as sold from products p left join transactions_product_sizes tpz on p.id = tpz.product_id join categories c on p.category_id = c.id group by p.id, p.product_name, p.price, c.category_name, p.image, p.created_at order by sold asc`;
        link += `transactions=${queryParams.transactions}&`;
      }
    }
    // PAGINASI
    let sendQuery = query;
    if (
      (queryParams.transactions &&
        queryParams.transactions == "popular" &&
        queryParams.search) ||
      (queryParams.transactions == "popular" && !queryParams.search)
    ) {
      sendQuery = querPopular;
      console.log(sendQuery);
    }
    console.log(sendQuery);
    let values = [];
    if (queryParams.page && queryParams.limit) {
      let page = parseInt(queryParams.page);
      let limit = parseInt(queryParams.limit);
      let offset = (page - 1) * limit;
      queryLimit = sendQuery + ` limit $1 offset $2`;
      values.push(limit, offset);
    } else {
      queryLimit = sendQuery;
    }
    postgreDb.query(sendQuery, (err, getData) => {
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

const productsRepo = {
  createProducts,
  deleteProducts,
  editProducts,
  getProducts,
  getbyid,
};

module.exports = productsRepo;
