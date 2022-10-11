const postgreDb = require("../config/postgre");

const createUsers = (body) => {
  return new Promise((resolve, reject) => {
    const query =
      "insert into users (displayname, firstname, lastname, date_of_birth, adress, email, password, phone, gender) values ($1,$2,$3,$4,$5,$6,$7,$8,$9)";
    const {
      displayname,
      firstname,
      lastname,
      date_of_birth,
      adress,
      email,
      password,
      phone,
      gender,
    } = body;
    const ress = {
      Display_Name: displayname,
      First_Name: firstname,
      Last_Name: lastname,
      Date_Of_Birth: date_of_birth,
      Adress: adress,
      Email: email,
      Password: password,
      Phone: phone,
      Gender: gender,
    };
    postgreDb.query(
      query,
      [
        displayname,
        firstname,
        lastname,
        date_of_birth,
        adress,
        email,
        password,
        phone,
        gender,
      ],
      (err, queryResult) => {
        if (err) {
          console.log(err);
          return reject(err);
        }
        resolve(ress);
      }
    );
  });
};

const editUsers = (body, params) => {
  return new Promise((resolve, reject) => {
    let query = "update users set ";
    const values = [];
    Object.keys(body).forEach((key, idx, array) => {
      if (idx === array.length - 1) {
        query += `${key} = $${idx + 1}, update_at = now() where users_id = $${
          idx + 2
        }`;
        values.push(body[key], params.id);
        return;
      }
      query += `${key} = $${idx + 1},`;
      values.push(body[key]);
    });
    postgreDb
      .query(query, values)
      .then((response) => {
        resolve([body, params.id]);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};
const getUsers = () => {
  return new Promise((resolve, reject) => {
    const query =
      "select users_id, displayname, firstname, lastname, date_of_birth, adress, email, password, phone, gender from users";
    postgreDb.query(query, (err, result) => {
      if (err) {
        console.log(err);
        return reject(err);
      }
      return resolve(result);
    });
  });
};
const usersRepo = {
  createUsers,
  editUsers,
  getUsers,
};

module.exports = usersRepo;
