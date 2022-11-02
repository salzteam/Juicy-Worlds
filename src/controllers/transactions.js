const transactionsRepo = require("../repo/transactions");
const client = require("../config/redis");

const create = async (req, res) => {
  console.log(req.body);
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
const payment = async (req, res) => {
  console.log(req.body);
  console.log(req.params);
  const result = await transactionsRepo.payment(req.body, req.params);
  res.status(result.statusCode).send(result);
};

const get = async (req, res) => {
  const hostApi = `${req.protocol}://${req.hostname}:${process.env.PORT}`;
  const result = await transactionsRepo.getTransactions(req.query, hostApi);
  res.status(result.statusCode).send(result);
};
const getHistory = async (req, res) => {
  const hostApi = `${req.protocol}://${req.hostname}:${process.env.PORT}`;
  const result = await transactionsRepo.historyTransactions(
    req.query,
    req.userPayload,
    hostApi
  );
  res.status(result.statusCode).send(result);
};
const getPending = async (req, res) => {
  const result = await transactionsRepo.getPending(req.query, req.userPayload);
  res.status(result.statusCode).send(result);
};
const transactionsControllers = {
  create,
  drop,
  edit,
  get,
  getHistory,
  getPending,
  payment,
};

module.exports = transactionsControllers;
