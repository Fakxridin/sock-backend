const { DataTypes, Model } = require("sequelize");
const sequelize = require("../db/db-sequelize");

class SalaryGiveModel extends Model {}

SalaryGiveModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    worker_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "workers", // Foreign key to workers table
        key: "id",
      },
      onDelete: "CASCADE", // If a worker is deleted, their salary records will also be deleted
    },
    summa: {
      type: DataTypes.DECIMAL(12, 5),
      allowNull: false,
      defaultValue: 0,
    },
    datetime: {
      type: DataTypes.INTEGER,
      allowNull: false, // Unix timestamp
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: "SalaryGiveModel",
    tableName: "salary_give",
    timestamps: true,
    paranoid: true,
  }
);

module.exports = SalaryGiveModel;
