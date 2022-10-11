const productsRepo = require("../repo/products");

const create = async (req, res) => {
  try {
    const response = await productsRepo.createProducts(req.body);
    res.status(201).json({
      result: "Data Create Results",
      data: response,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};
const drop = async (req, res) => {
  try {
    const result = await productsRepo.deleteProducts(req.params);
    res.status(200).json({ msg: "Data deleted from database" });
  } catch (err) {
    res.status(500).json({ msg: "Internal Server Error" });
  }
};
const edit = async (req, res) => {
  try {
    const response = await productsRepo.editProducts(req.body, req.params);
    res.status(200).json({
      msg: "Data has been updated",
      data_id: response[1],
      data: response[0],
    });
  } catch (err) {
    res.status(500).json({ msg: "Internal Server Error" });
  }
};
const get = async (req, res) => {
  try {
    const response = await productsRepo.getProducts(req.query);
    res.status(200).json({
      result: response.rows,
    });
  } catch (err) {
    if (err == 404) {
      res.status(404).json({
        msg: "Data Not Found",
      });
      return;
    }
    res.status(500).json({
      msg: "Internal Server Error",
    });
  }
};
const filter = async (req, res) => {
  try {
    const response = await productsRepo.filterProducts(req.query);
    res.status(200).json({
      result: response.rows,
    });
  } catch (error) {
    res.status(500).json({
      msg: "Internal Server Error",
    });
  }
};
const sorting = async (req, res) => {
  try {
    const response = await productsRepo.sortingProducts(req.query);
    res.status(200).json({
      result: response.rows,
    });
  } catch (error) {
    res.status(500).json({
      msg: "Internal Server Error",
    });
  }
};
const productsControllers = {
  create,
  drop,
  edit,
  get,
  filter,
  sorting,
};

module.exports = productsControllers;
