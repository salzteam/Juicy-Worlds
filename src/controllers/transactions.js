const transactionsRepo = require("../repo/transactions");

const create = async (req, res) => {
  try {
    const response = await transactionsRepo.createTransactions(req.body);
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
    const result = await transactionsRepo.deleteTransactions(req.params);
    res.status(200).json({ msg: "Data deleted from database" });
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
    res.status(200).json({
      msg: "Data has been updated",
      data: req.body,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};
const get = async (req, res) => {
  try {
    const response = await transactionsRepo.getTransactions(req.query);
    res.status(200).json({
      result: response.rows,
    });
  } catch (err) {
    res.status(500).json({
      msg: "Internal Server Error",
    });
  }
};
const getHistory = async (req, res) => {
  try {
    const response = await transactionsRepo.historyTransactions(req.params);
    res.status(200).json({
      result: response.rows,
    });
  } catch (err) {
    res.status(500).json({
      msg: "Internal Server Error",
    });
  }
};
// const sort = async (req, res) => {
//   try {
//     const response = await productsRepo.sortingHistory(req.query, req.params);
//     res.status(200).json({
//       result: response.rows,
//     });
//   } catch (error) {
//     res.status(500).json({
//       msg: "Internal Server Error",
//     });
//   }
// };
const transactionsControllers = {
  create,
  drop,
  edit,
  get,
  getHistory,
  // sort,
};

module.exports = transactionsControllers;
