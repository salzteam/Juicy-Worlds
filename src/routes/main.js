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
    "f7m9vCe5SdaCrmdYchSHR6:APA91bEqVr5V1LLN3Cyzd6ID87cYxu0pNGgOWxo6BFFRCXvBUmvoDFSG8rODybasACFv7u9Dc7wTjottzNka_q120Ze4jstZFWQ_gVk42U3uBs6Dd8tnZNzkrYCmmh0c28KEGq5RUv2l";
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
