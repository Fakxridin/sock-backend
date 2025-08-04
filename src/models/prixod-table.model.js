const { DataTypes, Model } = require("sequelize");
const sequelize = require("../db/db-sequelize");
class PrixodModel extends Model {}
PrixodModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    datetime: {
      type: DataTypes.INTEGER, // Unix timestamp
      allowNull: false,
    },
    total_overall_cost: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    rasxod_summa: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "PrixodModel",
    tableName: "prixod",
    timestamps: true,
    paranoid: true,
  }
);

class PrixodTableModel extends Model {}
PrixodTableModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    prixod_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "prixod", key: "id" },
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "product", key: "id" },
    },
    kontragent_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "kontragent", key: "id" },
    },
    miqdor: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    product_cost: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    initial_cost: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    total_cost: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "PrixodTableModel",
    tableName: "prixod_table",
    timestamps: true,
    paranoid: true,
  }
);

module.exports = {
  PrixodModel,
  PrixodTableModel,
};
