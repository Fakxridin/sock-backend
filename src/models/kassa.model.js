const { DataTypes, Model } = require("sequelize");
const sequelize = require("../db/db-sequelize");

class KassaModel extends Model {}

KassaModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    kurs_summa: {
      type: DataTypes.DECIMAL(18, 5),
      allowNull: false,
      defaultValue: 0,
    },
    som_summa: {
      type: DataTypes.DECIMAL(18, 5),
      allowNull: false,
      defaultValue: 0,
    },
    dollar_summa: {
      type: DataTypes.DECIMAL(18, 5),
      allowNull: false,
      defaultValue: 0,
    },
    type: {
      type: DataTypes.BOOLEAN, // true = kirim, false = chiqim
      allowNull: false,
    },
    doc_type: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    user_fullname: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    total_dollar_summa: {
      type: DataTypes.DECIMAL(18, 5),
      allowNull: false,
      defaultValue: 0,
    },
    total_som_summa: {
      type: DataTypes.DECIMAL(18, 5),
      allowNull: false,
      defaultValue: 0,
    },
    comment: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "KassaModel",
    tableName: "kassa",
    timestamps: true,
    paranoid: true,
  }
);

module.exports = KassaModel;
