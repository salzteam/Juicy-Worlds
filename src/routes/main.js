const express = require("express");
const { initializeApp, applicationDefault } = require("firebase-admin/app");
const { Messaging } = require("firebase-admin/messaging");

const app = initializeApp({
  credential: applicationDefault(),
});
const Notification = new Messaging(app);

const usersRouter = require("./users");
const productsRouter = require("./products");
const transactionRouter = require("./transactions");
const promoRouter = require("./promo");
const authRouter = require("./auth");
const imageUpload = require("../middlewares/upload");
const mainRouter = express.Router();
const prefix = "/api/v1";
mainRouter.use(`${prefix}/users`, usersRouter);
mainRouter.use(`${prefix}/products`, productsRouter);
mainRouter.use(`${prefix}/promo`, promoRouter);
mainRouter.use(`${prefix}/transactions`, transactionRouter);
mainRouter.use(`${prefix}/auth`, authRouter);
mainRouter.get("/", (req, res) => {
  res.json({
    msg: "Welcome",
  });
});
mainRouter.post(`/notification`, async (req, res) => {
  const { body } = req;
  const token =
    "frmbBakVSLGUkntnir8q0z:APA91bH4a_T_9IJt1uuXwem2NmBPwzmUmR7FMciivbWnMjLje0j-VotHPHz-4Z8knoK1Mf1EU5Arz8REsZbjAXTvr1uKirpE0jCVnG5n8BHwLatrCGBXcD9XQPNcR-AswnlHjDOutofw";
  try {
    await Notification.send({
      token,
      notification: {
        body: body.message,
        title: body.title,
      },
    });
    res.status(200).json({ message: "Notification sent successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "System Error" });
  }
});

module.exports = mainRouter;
