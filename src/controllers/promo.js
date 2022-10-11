const promoRepo = require("../repo/promo");

const create = async (req, res) => {
  try {
    const response = await promoRepo.createPromo(req.body);
    res.status(201).json({
      result: "Data Create Results",
      couponcode: response[0],
      discname: response[1],
      description: response[2],
      free: response[3],
      startdate: response[4],
      enddate: response[5],
      product_id: response[6],
      size: response[7],
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
      List_update_data: response[0],
    });
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
    if (error == 404) {
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
const promoControllers = {
  create,
  drop,
  edit,
  get,
  search,
};

module.exports = promoControllers;
