const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const JWTR = require("jwt-redis").default;
const postgreDb = require("../config/postgre");
const { sendMails } = require("../config/email");
const response = require("../helpers/response");
const {
  userLogin,
  wrongData,
  systemError,
  success,
  custMsg,
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
              expiresIn: "1d",
              issuer: process.env.ISSUER,
            })
            .then((token) => {
              // Token verification
              const sendRespon = {
                token: token,
                email: payload.email,
                id: response.rows[0].id,
                role: response.rows[0].role,
              };
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
    jwtr.destroy(token.jti).then((res) => {
      if (!res) resolve(unauthorized());
      resolve(success("Success logout account"));
    });
  });
};

const resetPassword = (body) => {
  return new Promise((resolve, reject) => {
    const { code, new_password, email } = body;
    if (email) {
      if (!code && !new_password) {
        let queryEmail =
          "select u.email, ud.display_name from users u left join userdata ud on u.id = ud.user_id where u.email = $1";
        postgreDb.query(queryEmail, [email], (err, resEmail) => {
          if (err) {
            console.log(err.message);
            resolve(systemError());
          }
          if (resEmail.rows.length == 0) return resolve(wrongData());
          const digits = "0123456789";
          let OTP = "";
          for (let i = 0; i < 6; i++) {
            OTP += digits[Math.floor(Math.random() * 10)];
          }
          //   console.log(resEmail.rows[0].name);
          const sendName = resEmail.rows[0].display_name || null;
          sendMails({
            to: email,
            OTP: OTP,
            name: sendName,
          }).then((result) => {
            client.get(OTP).then((results) => {
              if (results)
                return resolve(custMsg("Code already send to email!"));
              client
                .set(OTP, email, {
                  EX: 120,
                  NX: true,
                })
                .then(() => {
                  const data = {
                    message: "Link OTP send to email",
                    code: OTP,
                  };
                  resolve(success(data));
                });
            });
            // });
          });
        });
      }
    }
    if (code && new_password && email) {
      client.get(code).then((results) => {
        if (!results || results !== email)
          return resolve(custMsg("Code OTP Wrong!"));
        bcrypt.hash(new_password, 10, (err, newHashedPassword) => {
          if (err) {
            console.log(err);
            return resolve(systemError());
          }
          const editPwdQuery =
            "UPDATE users SET password = $1, updated_at = now() WHERE email = $2";
          const editPwdValues = [newHashedPassword, results];
          postgreDb.query(editPwdQuery, editPwdValues, (err, response) => {
            if (err) {
              console.log(err);
              return resolve(systemError());
            }
            resolve(success(null));
            client.del(code).then(() => {
              return client.del(results).then();
            });
          });
        });
      });
    }
  });
};

// const resetPassword = (body) => {
//   return new Promise((resolve, reject) => {
//     const { code, new_password, email } = body;
//     if (email) {
//       if (!code && !new_password) {
//         let queryEmail = "select email from users where email = $1";
//         postgreDb.query(queryEmail, [email], (err, resEmail) => {
//           if (err) {
//             console.log(err.message);
//             resolve(systemError());
//           }
//           if (resEmail.rows.length == 0) resolve(wrongData());
//           const digits = "0123456789";
//           let OTP = "";
//           for (let i = 0; i < 6; i++) {
//             OTP += digits[Math.floor(Math.random() * 10)];
//           }
//           client.get(OTP).then((results) => {
//             if (results) return resolve(custMsg("Code already send to email!"));
//             client
//               .set(OTP, email, {
//                 EX: 120,
//                 NX: true,
//               })
//               .then(() => {
//                 const data = {
//                   message: "Link OTP send to email",
//                   code: OTP,
//                 };
//                 resolve(success(data));
//               });
//           });
//           // });
//         });
//       }
//     }
//     if (code && new_password && email) {
//       client.get(code).then((results) => {
//         if (!results || results !== email)
//           return resolve(custMsg("Code OTP Wrong!"));
//         bcrypt.hash(new_password, 10, (err, newHashedPassword) => {
//           if (err) {
//             console.log(err);
//             return resolve(systemError());
//           }
//           const editPwdQuery =
//             "UPDATE users SET password = $1, updated_at = now() WHERE email = $2";
//           const editPwdValues = [newHashedPassword, results];
//           postgreDb.query(editPwdQuery, editPwdValues, (err, response) => {
//             if (err) {
//               console.log(err);
//               return resolve(systemError());
//             }
//             resolve(success(null));
//             client.del(code).then(() => {
//               return client.del(results).then();
//             });
//           });
//         });
//       });
//     }
//   });
// };

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

module.exports = { loginUser, logoutUser, resetPassword };
