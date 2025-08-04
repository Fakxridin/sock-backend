const { DataTypes, Model } = require("sequelize");
const sequelize = require("../db/db-sequelize");

class UpakovkaModel extends Model {}

UpakovkaModel.init(
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
      references: { model: "calculation", key: "id" },
    },
    miqdor: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    worker_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "workers", key: "id" },
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "user", key: "id" },
    },
  },
  {
    sequelize,
    modelName: "UpakovkaModel",
    tableName: "upakovka",
    timestamps: true,
    paranoid: false,
  }
);

module.exports = UpakovkaModel;
