const authRepo = require("../repo/auth");

const login = async (req, res) => {
  const result = await authRepo.loginUser(req.body);
  res.status(result.statusCode).send(result);
};
module.exports = { login };
