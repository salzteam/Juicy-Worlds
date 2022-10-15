const transactionsRepo = require("../repo/transactions");

const create = async (req, res) => {
  const result = await transactionsRepo.transaction(req.body, req.userPayload);
  res.status(result.statusCode).send(result);
};
const drop = async (req, res) => {
  const result = await transactionsRepo.deleteTransactions(req.params);
  res.status(result.statusCode).send(result);
};
const edit = async (req, res) => {
  const result = await transactionsRepo.editTransactions(req.body, req.params);
  res.status(result.statusCode).send(result);
};

const get = async (req, res) => {
  const result = await transactionsRepo.getTransactions(req.query);
  res.status(result.statusCode).send(result);
};
const getHistory = async (req, res) => {
  const result = await transactionsRepo.historyTransactions(
    req.query,
    req.userPayload
  );
  res.status(result.statusCode).send(result);
};
const transactionsControllers = {
  create,
  drop,
  edit,
  get,
  getHistory,
};

module.exports = transactionsControllers;
