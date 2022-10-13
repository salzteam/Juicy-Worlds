const promoRepo = require("../repo/promo");

const create = async (req, res) => {
  try {
    const response = await promoRepo.createPromo(req.body);
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
    const result = await promoRepo.deletePromo(req.params);
    res.status(200).json({ msg: "Data deleted from database" });
  } catch (err) {
    res.status(500).json({ msg: "Internal Server Error" });
  }
};
const edit = async (req, res) => {
  try {
    const response = await promoRepo.editPromo(req.body, req.params);
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
    const response = await promoRepo.getPromo(req.params);
    res.status(200).json({
      result: response.rows,
    });
  } catch (err) {
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
};

module.exports = promoControllers;
