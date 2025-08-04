const { DataTypes, Model } = require("sequelize");
const sequelize = require("../db/db-sequelize");

class TransactionProductModel extends Model {}

TransactionProductModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    transaction_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    food_shablon_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    miqdor: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "TransactionProductModel",
    tableName: "transaction_products",
    timestamps: true,
    paranoid: true,
  }
);

module.exports = TransactionProductModel;
