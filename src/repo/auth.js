const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const postgreDb = require("../config/postgre");
const response = require("../helpers/response");
const {
  userLogin,
  datareadyexsits,
  wrongData,
  systemError,
} = require("../helpers/templateResponse");

const loginUser = (body) => {
  return new Promise((resolve, reject) => {
    const { email, password } = body;
    const getPasswordByEmailQuery =
      "SELECT id, password, role FROM users WHERE email = $1";
    const getPasswordByEmailValues = [email];
    postgreDb.query(
      getPasswordByEmailQuery,
      getPasswordByEmailValues,
      (err, response) => {
        if (err) {
          console.log(err);
          return resolve(wrongData());
        }
        if (response.rows.length === 0) return resolve(wrongData());
        const hashedPassword = response.rows[0].password;
        bcrypt.compare(password, hashedPassword, (err, isSame) => {
          if (err) {
            console.log(err);
            return resolve(wrongData());
          }
          if (!isSame) return resolve(wrongData());

          const payload = {
            user_id: response.rows[0].id,
            name: response.rows[0].name,
            role: response.rows[0].role,
            email,
          };
          jwt.sign(
            payload,
            process.env.SECRET_KEY,
            {
              expiresIn: "1d",
              issuer: process.env.ISSUER,
            },
            (err, token) => {
              if (err) {
                console.log(err);
                return resolve(systemError);
              }
              const sendRespon = {
                token: token,
                email: payload.email,
              };
              return resolve(userLogin(sendRespon));
            }
          );
        });
      }
    );
  });
};

module.exports = { loginUser };
