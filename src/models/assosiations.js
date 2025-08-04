// models/associations.js

const {
  ProductModel,
  UnitModel,
  PrixodModel,
  PrixodTableModel,
  AttendanceModel,
  WorkerModel,
  KontragentModel,
  NeededProductModel,
  FoodShablonModel,
  TransactionProductModel,
  UserModel,
  TransactionModel,
  TikishModel,
  DazmolModel,

  AverloModel,
} = require("./index");
const UpakovkaModel = require("./upakovka.model");

// Product ↔ Unit
ProductModel.belongsTo(UnitModel, { foreignKey: "unit_id", as: "unit" });
UnitModel.hasMany(ProductModel, { foreignKey: "unit_id", as: "products" });

// Attendance ↔ Worker
AttendanceModel.belongsTo(WorkerModel, {
  foreignKey: "worker_id",
  as: "worker",
});

// Prixod ↔ PrixodTable
PrixodModel.hasMany(PrixodTableModel, {
  foreignKey: "prixod_id",
  as: "prixodItems",
});
PrixodTableModel.belongsTo(PrixodModel, {
  foreignKey: "prixod_id",
  as: "prixod",
});

// PrixodTable ↔ Product
PrixodTableModel.belongsTo(ProductModel, {
  foreignKey: "product_id",
  as: "product",
});
ProductModel.hasMany(PrixodTableModel, {
  foreignKey: "product_id",
  as: "prixodLines",
});

// PrixodTable ↔ Kontragent
PrixodTableModel.belongsTo(KontragentModel, {
  foreignKey: "kontragent_id",
  as: "kontragent",
});
KontragentModel.hasMany(PrixodTableModel, {
  foreignKey: "kontragent_id",
  as: "prixodEntries",
});

// Product ↔ NeededProduct
ProductModel.hasMany(NeededProductModel, {
  foreignKey: "product_id",
  as: "neededIn",
});
NeededProductModel.belongsTo(ProductModel, {
  foreignKey: "product_id",
  as: "product",
});

// FoodShablon ↔ NeededProduct
FoodShablonModel.hasMany(NeededProductModel, {
  foreignKey: "food_shablon_id",
  as: "ingredients",
});
NeededProductModel.belongsTo(FoodShablonModel, {
  foreignKey: "food_shablon_id",
  as: "shablon",
});

// Transaction ↔ User (skladchi & oluvchi)
TransactionModel.belongsTo(UserModel, {
  foreignKey: "skladchi_id",
  as: "skladchi",
});
TransactionModel.belongsTo(UserModel, {
  foreignKey: "oluvchi_id",
  as: "oluvchi",
});

// Transaction ↔ TransactionProduct
TransactionModel.hasMany(TransactionProductModel, {
  foreignKey: "transaction_id",
  as: "products",
});
TransactionProductModel.belongsTo(TransactionModel, {
  foreignKey: "transaction_id",
});

// TransactionProduct ↔ Product
TransactionProductModel.belongsTo(ProductModel, {
  foreignKey: "product_id",
  as: "product",
});

// TransactionProduct ↔ FoodShablon
TransactionProductModel.belongsTo(FoodShablonModel, {
  foreignKey: "food_shablon_id",
  as: "shablon",
});
// TikishModel
TikishModel.belongsTo(WorkerModel, {
  foreignKey: "worker_id",
  as: "tikish_worker",
});
TikishModel.belongsTo(UserModel, {
  foreignKey: "user_id",
  as: "tikish_user",
});
TikishModel.belongsTo(FoodShablonModel, {
  foreignKey: "shablon_id",
  as: "tikish_shablon", // Changed alias
});

WorkerModel.hasMany(TikishModel, { foreignKey: "worker_id", as: "tikishlar" });
UserModel.hasMany(TikishModel, {
  foreignKey: "user_id",
  as: "tikishlar",
});
FoodShablonModel.hasMany(TikishModel, {
  foreignKey: "shablon_id",
  as: "tikishlar",
});

// DazmolModel
DazmolModel.belongsTo(WorkerModel, {
  foreignKey: "worker_id",
  as: "dazmol_worker",
});
DazmolModel.belongsTo(UserModel, {
  foreignKey: "user_id",
  as: "dazmol_user",
});
DazmolModel.belongsTo(FoodShablonModel, {
  foreignKey: "shablon_id",
  as: "dazmol_shablon", // Changed alias
});

WorkerModel.hasMany(DazmolModel, { foreignKey: "worker_id", as: "dazmollar" });
UserModel.hasMany(DazmolModel, {
  foreignKey: "user_id",
  as: "dazmollar",
});
FoodShablonModel.hasMany(DazmolModel, {
  foreignKey: "shablon_id",
  as: "dazmollar",
});

// UpakovkaModel
UpakovkaModel.belongsTo(WorkerModel, {
  foreignKey: "worker_id",
  as: "upakovka_worker",
});
UpakovkaModel.belongsTo(UserModel, {
  foreignKey: "user_id",
  as: "upakovka_user",
});
UpakovkaModel.belongsTo(FoodShablonModel, {
  foreignKey: "shablon_id",
  as: "upakovka_shablon", // Changed alias
});
WorkerModel.hasMany(UpakovkaModel, {
  foreignKey: "worker_id",
  as: "upakovkalar",
});
UserModel.hasMany(UpakovkaModel, { foreignKey: "user_id", as: "upakovkalar" });
FoodShablonModel.hasMany(UpakovkaModel, {
  foreignKey: "shablon_id",
  as: "upakovkalar",
});

// AverloModel
AverloModel.belongsTo(WorkerModel, {
  foreignKey: "worker_id",
  as: "averlo_worker",
});
AverloModel.belongsTo(UserModel, {
  foreignKey: "user_id",
  as: "averlo_user",
});
AverloModel.belongsTo(FoodShablonModel, {
  foreignKey: "shablon_id",
  as: "averlo_shablon", // Changed alias
});
WorkerModel.hasMany(AverloModel, { foreignKey: "worker_id", as: "averlolar" });
UserModel.hasMany(AverloModel, { foreignKey: "user_id", as: "averlolar" });
FoodShablonModel.hasMany(AverloModel, {
  foreignKey: "shablon_id",
  as: "averlolar",
});
