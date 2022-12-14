const usersRepo = require("../repo/users");

const createAccount = async (req, res) => {
  const result = await usersRepo.createUsers(req.body);
  res.status(result.statusCode).send(result);
};
// const createProfile = async (req, res) => {
//   const result = await usersRepo.createProfile(
//     req.body,
//     req.userPayload,
//     req.file
//   );
//   res.status(result.statusCode).send(result);
// };
const editProfile = async (req, res) => {
  const result = await usersRepo.editPorfile(
    req.body,
    req.userPayload,
    req.file
  );
  res.status(result.statusCode).send(result);
};
const editUser = async (req, res) => {
  const result = await usersRepo.editUser(req.body, req.userPayload);
  res.status(result.statusCode).send(result);
};
const editPwd = async (req, res) => {
  const result = await usersRepo.editPassword(req.body, req.userPayload);
  res.status(result.statusCode).send(result);
};

const getUser = async (req, res) => {
  const result = await usersRepo.getUsersDatas();
  res.status(result.statusCode).send(result);
};
const getUserProfile = async (req, res) => {
  const result = await usersRepo.getUsersProfile(req.userPayload);
  res.status(result.statusCode).send(result);
};
const usersControllers = {
  createAccount,
  editPwd,
  editProfile,
  getUser,
  getUserProfile,
  editUser,
};

module.exports = usersControllers;
