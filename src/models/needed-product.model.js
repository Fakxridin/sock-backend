const { DataTypes, Model } = require("sequelize");
const sequelize = require("../db/db-sequelize");

class NeededProductModel extends Model {}

NeededProductModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    food_shablon_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "food_shablon", key: "id" },
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "product", key: "id" },
    },
    miqdor: {
      type: DataTypes.DECIMAL(12, 5),
      allowNull: false,
    },
    summa: {
      type: DataTypes.DECIMAL(12, 5),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "NeededProductModel",
    tableName: "needed_products",
    timestamps: true,
    paranoid: true,
  }
);

module.exports = NeededProductModel;
