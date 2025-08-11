// models/markedCost.model.js

const { DataTypes, Model } = require("sequelize");
const sequelize = require("../db/db-sequelize");

class MarkedCostModel extends Model {}

MarkedCostModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    tikish_cost: {
      type: DataTypes.DECIMAL(12, 5),
      allowNull: false,
      defaultValue: 0,
    },
    averlo_cost: {
      type: DataTypes.DECIMAL(12, 5),
      allowNull: false,
      defaultValue: 0,
    },
    dazmol_cost: {
      type: DataTypes.DECIMAL(12, 5),
      allowNull: false,
      defaultValue: 0,
    },
    upakovka_cost: {
      type: DataTypes.DECIMAL(12, 5),
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: "MarkedCostModel",
    tableName: "marked_costs",
    timestamps: true,
    paranoid: true,
  }
);

module.exports = MarkedCostModel;
