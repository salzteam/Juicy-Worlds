const bcrypt = require("bcrypt");
const response = require("../helpers/response");
const {
  success,
  notFound,
  systemError,
  created,
  emailreadyexsits,
  datareadyexsits,
  custMsg,
  phonealreadyexsits,
} = require("../helpers/templateResponse");
const deleteFile = require("../helpers/deletefile");
const postgreDb = require("../config/postgre");

const createUsers = (body) => {
  return new Promise((resolve, reject) => {
    const { email, password, phone } = body;
    const validasiEmail = `select email from users where email like $1`;
    const validasiPhone = `select phone from users where phone like $1`;
    postgreDb.query(validasiEmail, [email], (err, resEmail) => {
      if (err) return resolve(systemError());
      if (resEmail.rows.length > 0) {
        return resolve(emailreadyexsits());
      }
      postgreDb.query(validasiPhone, [phone], (err, resPhone) => {
        if (err) return resolve(systemError());
        if (resPhone.rows.length > 0) {
          return resolve(phonealreadyexsits());
        }
        bcrypt.hash(password, 10, (err, hashedPassword) => {
          if (err) {
            console.log(err);
            return resolve(systemError());
          }
          const query =
            "INSERT INTO users (email, password, phone, role) VALUES ($1, $2, $3, 'users') RETURNING id";
          const values = [email, hashedPassword, phone];
          postgreDb.query(query, values, (err, result) => {
            if (err) {
              console.log(err);
              return resolve(systemError());
            }
            postgreDb.query(
              "INSERT INTO userdata (user_id, date_of_birth ,gender, adress, displaypicture) VALUES ($1,$2,$3, '- ', 'https://res.cloudinary.com/dwo9znbl6/image/upload/v1667575327/JuicyWorlds/default-profile-pic_tjjaqo.webp')",
              [result.rows[0].id, null, null],
              (err, response) => {
                if (err) {
                  console.log(err);
                  postgreDb.query(
                    "delete from users where id = $1",
                    [result.rows[0].id],
                    (err, res) => {
                      if (err) console.log(err);
                    }
                  );
                  return resolve(systemError());
                }
                return resolve(
                  created({
                    ...result.rows[0],
                    email: body.email,
                    phone: body.phone,
                  })
                );
              }
            );
          });
        });
      });
    });
  });
};

// const createProfile = (body, token, file) => {
//   return new Promise((resolve, reject) => {
//     const { displayName, firstname, lastname, date_of_birth, adress, gender } =
//       body;
//     const userId = token.user_id;
//     let image = null;
//     if (file) {
//       image = "/images/" + file.filename;
//     }
//     const getData = "select user_id from userdata where user_id = $1";
//     postgreDb.query(getData, [userId], (err, resData) => {
//       if (err) {
//         console.log(err);
//         if (file) deleteFile(file.path);
//         return resolve(systemError());
//       }
//       if (resData.rows.length > 0) {
//         if (file) deleteFile(file.path);
//         return resolve(datareadyexsits());
//       }
//       const query =
//         "INSERT INTO userdata (user_id, display_name, firstname, lastname, date_of_birth, adress, gender, displaypicture) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)";
//       postgreDb.query(
//         query,
//         [
//           userId,
//           displayName,
//           firstname,
//           lastname,
//           date_of_birth,
//           adress,
//           gender,
//           image,
//         ],
//         (err, response) => {
//           if (err) {
//             console.log(err);
//             if (file) deleteFile(file.path);
//             return resolve(systemError());
//           }
//           const sendResponse = {
//             displayName: body.displayName,
//             firstname: body.firstname,
//             lastname: body.lastname,
//             date_of_birth: body.date_of_birth,
//             address: body.adress,
//             gender: body.gender,
//             displayPicture: image,
//           };
//           resolve(created(sendResponse));
//         }
//       );
//     });
//   });
// };

const editPorfile = (body, token, file) => {
  return new Promise((resolve, reject) => {
    const { display_name, firstname, lastname, date_of_birth, adress, gender } =
      body;
    let query = "update userdata set ";
    const values = [];
    const userId = token.user_id;
    let imageProduct = "";
    let data = {};
    if (file) {
      imageProduct = file.url;
      if (
        !display_name &&
        !firstname &&
        !lastname &&
        !date_of_birth &&
        !adress &&
        !gender
      ) {
        if (file && file.resource_type == "image") {
          query += `displaypicture = '${imageProduct}',updated_at = now() where user_id = $1`;
          values.push(userId);
          data["image"] = imageProduct;
        }
      } else {
        if (file && file.fieldname == "image") {
          query += `displaypicture = '${imageProduct}',`;
          data["image"] = imageProduct;
        }
      }
    }
    const getData = "select * from userdata where user_id = $1";
    postgreDb.query(getData, [userId], (err, resData) => {
      if (err) {
        console.log(err);
        if (file) {
          deleteFile(file.path);
        }
        return resolve(systemError());
      }
      if (resData.rows.length < 1) {
        if (file) {
          deleteFile(file.path);
        }
        return resolve(notFound());
      }
      Object.keys(body).forEach((key, idx, array) => {
        if (key == "image") key = "displaypicture";
        if (idx === array.length - 1) {
          query += `${key} = $${idx + 1},updated_at = now() where user_id = $${
            idx + 2
          }`;
          values.push(body[key], userId);
          data[key] = body[key];
          return;
        }
        query += `${key} = $${idx + 1},`;
        values.push(body[key]);
        data[key] = body[key];
      });
      console.log(query);
      postgreDb
        .query(query, values)
        .then((response) => {
          resolve(success(data));
        })
        .catch((err) => {
          console.log(err);
          if (file) {
            deleteFile(file.path);
          }
          resolve(systemError());
        });
    });
  });
};
const editUser = (body, token) => {
  return new Promise((resolve, reject) => {
    const { email, phone } = body;
    let query = "update users set ";
    const validasiEmail = `select email from users where email like $1`;
    const validasiPhone = `select phone from users where phone like $1`;
    postgreDb.query(validasiEmail, [email], (err, resEmail) => {
      if (err) {
        console.log(err);
        return resolve(systemError());
      }
      if (resEmail.rows.length > 0) {
        return resolve(emailreadyexsits());
      }
      postgreDb.query(validasiPhone, [phone], (err, resPhone) => {
        if (err) {
          console.log(err);
          return resolve(systemError());
        }
        if (resPhone.rows.length > 0) {
          return resolve(phonealreadyexsits());
        }
        const values = [];
        const userId = token.user_id;
        let data = {};
        Object.keys(body).forEach((key, idx, array) => {
          if (idx === array.length - 1) {
            query += `${key} = $${idx + 1},updated_at = now() where id = $${
              idx + 2
            }`;
            values.push(body[key], userId);
            data[key] = body[key];
            return;
          }
          query += `${key} = $${idx + 1},`;
          values.push(body[key]);
          data[key] = body[key];
        });
        console.log(query);
        postgreDb
          .query(query, values)
          .then((response) => {
            resolve(success(data));
          })
          .catch((err) => {
            console.log(err);
            resolve(systemError());
          });
      });
    });
  });
};

const editPassword = (body, token) => {
  return new Promise((resolve, reject) => {
    const { password, new_password } = body;
    const getPwdQuery = "SELECT password FROM users WHERE id = $1";
    const getPwdValues = [token.user_id];
    postgreDb.query(getPwdQuery, getPwdValues, (err, response) => {
      if (err) {
        console.log(err);
        return resolve(systemError());
      }
      const hashedPassword = response.rows[0].password;
      bcrypt.compare(password, hashedPassword, (err, isSame) => {
        if (err) {
          console.log(err);
          return resolve(systemError());
        }
        if (!isSame) return resolve(custMsg("Password is wrong"));
        bcrypt.hash(new_password, 10, (err, newHashedPassword) => {
          if (err) {
            console.log(err);
            return resolve(systemError());
          }
          const editPwdQuery =
            "UPDATE users SET password = $1, updated_at = now() WHERE email = $2";
          const editPwdValues = [newHashedPassword, token.user_id];
          postgreDb.query(editPwdQuery, editPwdValues, (err, response) => {
            if (err) {
              console.log(err);
              return resolve(systemError());
            }
            return resolve(success(null));
          });
        });
      });
    });
  });
};

const getUsersDatas = () => {
  return new Promise((resolve, reject) => {
    const query1 = "select id, email,phone,role from users";
    const query2 =
      "select user_id, display_name, firstname, lastname,date_of_birth,adress,gender from userdata";
    postgreDb.query(query1, (err, datas) => {
      if (err) {
        resolve(systemError());
      }
      postgreDb.query(query2, (err, profiles) => {
        if (err) {
          resolve(systemError());
        }
        const results = {
          dataUser: datas.rows,
          profileUser: profiles.rows,
        };
        resolve(success(results));
      });
    });
  });
};
const getUsersProfile = (token) => {
  return new Promise((resolve, reject) => {
    const query = "select * from users where id = $1";
    const query2 = "select * from userdata where user_id = $1";
    postgreDb.query(query, [token.user_id], (err, users) => {
      postgreDb.query(query2, [token.user_id], (err, profiles) => {
        if (err) {
          resolve(systemError());
        }
        const results = {
          profileData: users.rows,
          profileUser: profiles.rows,
        };
        resolve(success(results));
      });
    });
  });
};
const usersRepo = {
  createUsers,
  getUsersDatas,
  editPassword,
  editPorfile,
  getUsersProfile,
  editUser,
};

module.exports = usersRepo;
