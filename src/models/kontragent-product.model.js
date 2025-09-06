const { DataTypes, Model } = require("sequelize");
const sequelize = require("../db/db-sequelize");

class KontragentShablonModel extends Model {}

KontragentShablonModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    user_name: {
      type: DataTypes.STRING(191),
      allowNull: false,
    },
    kontragent_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("give", "take"),
      allowNull: false,
    },
    total_summa: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: "KontragentShablonModel",
    tableName: "kontragent_shablon",
    timestamps: true,
    paranoid: true,
  }
);

module.exports = KontragentShablonModel;
