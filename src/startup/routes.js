const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const i18n = require("./i18n.config");
const errorMiddleware = require("../middleware/error.middleware");
const userRouter = require("../routes/user.route");
const unitRouter = require("../routes/unit.route");
const productRouter = require("../routes/product.route");
const kontragentRouter = require("../routes/kontragent.route");
const workerRouter = require("../routes/worker.route");
const atttendancerouter = require("../routes/attendance.route");
const prixodRouter = require("../routes/prixod.route");
const calculationRouter = require("../routes/calculation.route");
const transactionRouter = require("../routes/transaction.routes");
const tikishRouter = require("../routes/tikish.route");
const averloRouter = require("../routes/averlo.route");
const dazmolRouter = require("../routes/dazmol.route");
const upakovkaRouter = require("../routes/upakovka.router");
const HttpException = require("../utils/HttpException.utils");

module.exports = async function (app) {
  app.use(express.json());

  app.use(cors());

  app.options("*", cors());
  app.use(express.static(path.join(__dirname, "../../dist")));

  app.use(cookieParser());
  app.use(i18n.init);
  app.use(
    "/api/v1/uploads",
    express.static(path.join(__dirname, "../uploads"))
  );
  app.use(`/api/v1/users`, userRouter);
  app.use(`/api/v1/unit`, unitRouter);
  app.use(`/api/v1/product`, productRouter);
  app.use(`/api/v1/kontragent`, kontragentRouter);
  app.use(`/api/v1/attendance`, atttendancerouter);
  app.use(`/api/v1/worker`, workerRouter);
  app.use(`/api/v1/prixod`, prixodRouter);
  app.use(`/api/v1/calculation`, calculationRouter);
  app.use(`/api/v1/transaction`, transactionRouter);
  app.use(`/api/v1/tikish`, tikishRouter);
  app.use(`/api/v1/averlo`, averloRouter);
  app.use(`/api/v1/dazmol`, dazmolRouter);
  app.use(`/api/v1/upakovka`, upakovkaRouter);
  app.all("*", (req, res, next) => {
    const err = new HttpException(404, req.mf("Endpoint not found"));
    next(err);
  });

  app.use(errorMiddleware);
};
