// models/averlo.model.js

const { DataTypes, Model } = require("sequelize");
const sequelize = require("../db/db-sequelize");

class AverloModel extends Model {}

AverloModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    shablon_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "calculation",
        key: "id",
      },
    },
    miqdor: {
      type: DataTypes.DECIMAL(14, 5), // yuqori aniqlik uchun
      allowNull: true,
    },
    worker_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "workers",
        key: "id",
      },
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "user",
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "AverloModel",
    tableName: "averlo",
    timestamps: true,
    paranoid: false,
  }
);

module.exports = AverloModel;
