const { DataTypes, Model } = require("sequelize");
const sequelize = require("../db/db-sequelize");

class KontragentShablonProductModel extends Model {}

KontragentShablonProductModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    kontragent_shablon_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    shablon_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    miqdor: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    narx: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    summa: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "KontragentShablonProductModel",
    tableName: "kontragent_shablon_products",
    timestamps: true,
    paranoid: true,
  }
);

module.exports = KontragentShablonProductModel;
