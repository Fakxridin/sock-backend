const { DataTypes, Model } = require("sequelize");
const sequelize = require("../db/db-sequelize");

class SalaryRegisterModel extends Model {}

SalaryRegisterModel.init(
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
    tikish_soni: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    averlo_soni: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    dazmol_soni: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    etiketika_soni: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    upakovka_soni: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    datetime: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: "SalaryRegisterModel",
    tableName: "salary_registers",
    timestamps: true,
    paranoid: true,
  }
);

module.exports = SalaryRegisterModel;
