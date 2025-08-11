const { DataTypes, Model } = require("sequelize");
const sequelize = require("../db/db-sequelize");

class WorkerModel extends Model {}

WorkerModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    fullname: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    phone_number: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    fixed_salary: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    is_fixed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    stanokdan_soni: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    bichishdan_soni: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    dazmoldan_soni: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    bezakdan_soni: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    total_balance: {
      type: DataTypes.DECIMAL(12, 5),
      allowNull: false,
      defaultValue: 0,
    },
    total_dollar_balance: {
      type: DataTypes.DECIMAL(12, 5),
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: "WorkerModel",
    tableName: "workers",
    timestamps: true,
    paranoid: true,
  }
);

module.exports = WorkerModel;
