const usersRepo = require("../repo/users");

const create = async (req, res) => {
  try {
    const response = await usersRepo.createUsers(req.body);
    res.status(201).json({
      result: "Data Create Results",
      displayname: response[0],
      firstname: response[1],
      lastname: response[2],
      date_of_birth: response[3],
      adress: response[4],
      email: response[5],
      password: response[6],
      phone: response[7],
      gender: response[8],
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};
const edit = async (req, res) => {
  try {
    const response = await usersRepo.editUsers(req.body, req.params);
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
    const response = await usersRepo.getUsers();
    res.status(200).json({
      result: response.rows,
    });
  } catch (err) {
    if (err == 404) {
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
const usersControllers = {
  create,
  edit,
  get,
};

module.exports = usersControllers;
