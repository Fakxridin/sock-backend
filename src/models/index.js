// models/index.js
const sequelize = require("../db/db-sequelize");
const UserModel = require("./user.model");
const ProductModel = require("./product.model");
const UnitModel = require("./unit.model");
const { PrixodModel } = require("./prixod-table.model");
const { PrixodTableModel } = require("./prixod-table.model");
const KontragentModel = require("./kontragent.model");
const AttendanceModel = require("./attendance.model");
const WorkerModel = require("./worker.model");
const FoodShablonModel = require("./calculation.model");
const NeededProductModel = require("./needed-product.model");
const TransactionProductModel = require("./transaction-products.model");
const TransactionModel = require("./transaction.model");
const TikishModel = require("./tikish.model");
const DazmolModel = require("./dazmol.model");
const UpakovkaModel = require("./dazmol.model");
const AverloModel = require("./averlo.model");
module.exports = {
  sequelize,

  UserModel,
  ProductModel,
  UnitModel,
  PrixodModel,
  PrixodTableModel,
  KontragentModel,
  AttendanceModel,
  WorkerModel,
  FoodShablonModel,
  NeededProductModel,
  TransactionProductModel,
  TransactionModel,
  TikishModel,
  DazmolModel,
  UpakovkaModel,
  AverloModel,
};
