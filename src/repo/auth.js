const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const JWTR = require("jwt-redis").default;
const postgreDb = require("../config/postgre");
const response = require("../helpers/response");
const {
  userLogin,
  wrongData,
  systemError,
  success,
  unauthorized,
} = require("../helpers/templateResponse");
const client = require("../config/redis");

const loginUser = (body) => {
  return new Promise((resolve, reject) => {
    const jwtr = new JWTR(client);
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
          jwtr
            .sign(payload, process.env.SECRET_KEY, {
              expiresIn: "5m",
              issuer: process.env.ISSUER,
            })
            .then((token) => {
              // Token verification
              const sendRespon = {
                token: token,
                email: payload.email,
              };
              console.log(token);
              return resolve(userLogin(sendRespon));
            });
          // jwt.sign(
          //   payload,
          //   process.env.SECRET_KEY,
          //   {
          //     expiresIn: "1d",
          //     issuer: process.env.ISSUER,
          //   },
          //   (err, token) => {
          //     if (err) {
          //       console.log(err.message);
          //       return resolve(systemError);
          //     }
          //     client.set(String(payload.user_id), token);
          //     const sendRespon = {
          //       token: token,
          //       email: payload.email,
          //     };
          //     return resolve(userLogin(sendRespon));
          //   }
          // );
        });
      }
    );
  });
};

const logoutUser = (token) => {
  return new Promise((resolve, reject) => {
    const jwtr = new JWTR(client);
    console.log(token);
    jwtr.destroy(token.jti).then((res) => {
      if (!res) resolve(unauthorized());
      resolve(success("Success logout account"));
    });
  });
};

// const logoutUser = (token) => {
//   return new Promise((resolve, reject) => {
//     const userId = token.user_id;
//     client.connect().then((ress) => {
//       client
//         .get(String(userId))
//         .then((result) => {
//           console.log(result);
//           if (tokens == token) {
//             client.DEL(String(userId)).then((resultt) => {
//               console.log(resultt);
//               client.quit();
//               return resolve(success());
//             });
//           }
//           return resolve(systemError);
//         })
//         .catch((err) => {
//           console.log(err);
//         });
//     });
//   });
// };

module.exports = { loginUser, logoutUser };
