const promoRepo = require("../repo/promo");

const create = async (req, res) => {
  try {
    const response = await promoRepo.createPromo(req.body);
    res.status(201).json({
      result: response,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};
const drop = async (req, res) => {
  try {
    const result = await promoRepo.deletePromo(req.params);
    res.status(200).json({ result });
  } catch (err) {
    res.status(500).json({ msg: "Internal Server Error" });
  }
};
const edit = async (req, res) => {
  try {
    const response = await promoRepo.editPromo(req.body, req.params);
    res.status(200).json({ result: response });
  } catch (err) {
    res.status(500).json({ msg: "Internal Server Error" });
  }
};
const get = async (req, res) => {
  try {
    const response = await promoRepo.getPromo();
    res.status(200).json({
      result: response.rows,
    });
  } catch (err) {
    res.status(500).json({
      msg: "Internal Server Error",
    });
  }
};
const search = async (req, res) => {
  try {
    const response = await promoRepo.searchPromo(req.query);
    res.status(200).json({
      result: response.rows,
    });
  } catch (error) {
    res.status(500).json({
      msg: "Internal Server Error",
    });
  }
};
const promoControllers = {
  create,
  drop,
  edit,
  get,
  search,
};

module.exports = promoControllers;
