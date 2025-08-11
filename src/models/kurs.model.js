const { DataTypes, Model } = require("sequelize");
const sequelize = require("../db/db-sequelize");

class KursModel extends Model {}

KursModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    summa: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "KursModel",
    tableName: "kurs",
    timestamps: true,
    paranoid: false,
  }
);

module.exports = KursModel;
