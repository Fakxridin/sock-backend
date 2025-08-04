const { DataTypes, Model } = require("sequelize");
const sequelize = require("../db/db-sequelize");

class TransactionModel extends Model {}

TransactionModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    is_accepted: {
      type: DataTypes.ENUM("kutilmoqda", "tasdiq", "rad"),
      allowNull: false,
    },
    skladchi_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    oluvchi_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    qayerdan: {
      type: DataTypes.ENUM("Sklad1", "Sklad2"),
      allowNull: false,
    },
    qayerga: {
      type: DataTypes.ENUM("Sklad1", "Sklad2"),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "TransactionModel",
    tableName: "transactions",
    timestamps: true,
    paranoid: true,
  }
);

module.exports = TransactionModel;
