const transactionsRepo = require("../repo/transactions");

const create = async (req, res) => {
  try {
    const response = await transactionsRepo.createTransactions(req.body);
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
    const result = await transactionsRepo.deleteTransactions(req.params);
    res.status(200).json({ result });
  } catch (err) {
    res.status(500).json({ msg: "Internal Server Error" });
  }
};
const edit = async (req, res) => {
  try {
    const response = await transactionsRepo.editTransactions(
      req.body,
      req.params
    );
    res.status(200).json({ result: response });
  } catch (err) {
    res.status(500).json({ msg: "Internal Server Error" });
  }
};
const get = async (req, res) => {
  try {
    const response = await transactionsRepo.getTransactions();
    res.status(200).json({
      result: response.rows,
    });
  } catch (err) {
    res.status(500).json({
      msg: "Internal Server Error",
    });
  }
};
const transactionsControllers = {
  create,
  drop,
  edit,
  get,
};

module.exports = transactionsControllers;
