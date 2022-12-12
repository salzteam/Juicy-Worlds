const transactionsRepo = require("../repo/transactions");
const midtransClient = require("midtrans-client");

let snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.SERVER_KEY_MIDTRANS,
  clientKey: process.env.CLIENT_KEY_MIDTRANS,
});

const create = async (req, res) => {
  const result = await transactionsRepo.transaction(req.body, req.userPayload);
  let sendData = { result };
  if (req.body.payment === "1") {
    let parameter = {
      transaction_details: {
        order_id: result.data.id_transactions,
        gross_amount: result.data.subtotal,
      },
      credit_card: {
        secure: true,
      },
    };
    const Redirect = await snap
      .createTransaction(parameter)
      .then((transaction) => {
        // transaction redirect_url
        return transaction.redirect_url;
      });
    sendData = {
      ...result,
      redirctUrl: Redirect,
    };
  }
  res.status(result.statusCode).send(sendData);
};

const handleMidtrans = async (req, res) => {
  const { fraud_status, transaction_status, order_id } = req.body;
  let status = "2";
  if (
    transaction_status === "cancel" ||
    transaction_status === "expire" ||
    transaction_status == "deny"
  ) {
    status = "4";
    status_order = transaction_status;
  }
  if (transaction_status !== "pending") {
    status = "1";
    status_order = transaction_status;
  }

  await transactionsRepo.paymentMidtrans(status, order_id);
  return res.status(200).send({ message: "get checkout by id succes" });
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
  const result = await transactionsRepo.payment(req.body, req.params);
  res.status(result.statusCode).send(result);
};

const get = async (req, res) => {
  const hostApi = `${req.protocol}://${req.hostname}`;
  const result = await transactionsRepo.getTransactions(req.query, hostApi);
  res.status(result.statusCode).send(result);
};
const getHistory = async (req, res) => {
  const hostApi = `${req.protocol}://${req.hostname}`;
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
  handleMidtrans,
};

module.exports = transactionsControllers;
