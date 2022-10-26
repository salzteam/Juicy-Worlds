const authRepo = require("../repo/auth");
const client = require("../config/redis");

const login = async (req, res) => {
  const result = await authRepo.loginUser(req.body);
  res.status(result.statusCode).send(result);
};
const logout = async (req, res) => {
  const result = await authRepo.logoutUser(req.userPayload);
  res.status(result.statusCode).send(result);
};
const forgot = async (req, res) => {
  const result = await authRepo.resetPassword(req.body);
  res.status(result.statusCode).send(result);
};
module.exports = { login, logout, forgot };
