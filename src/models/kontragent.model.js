const { DataTypes, Model } = require("sequelize");
const sequelize = require("../db/db-sequelize");

class KontragentModel extends Model {}
KontragentModel.init(
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
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    balance: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: "KontragentModel",
    tableName: "kontragent",
    timestamps: true,
    paranoid: true,
  }
);

module.exports = KontragentModel;
