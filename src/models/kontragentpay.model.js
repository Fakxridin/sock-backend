const { DataTypes, Model } = require("sequelize");
const sequelize = require("../db/db-sequelize");

class KontragentPayModel extends Model {}

KontragentPayModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    kontragent_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "kontragent",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    kassa_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "kassa",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    user_fullname: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    kurs_summa: {
      type: DataTypes.DECIMAL(18, 5),
      allowNull: false,
      defaultValue: 0,
    },
    dollar_summa: {
      type: DataTypes.DECIMAL(18, 5),
      allowNull: false,
      defaultValue: 0,
    },
    som_summa: {
      type: DataTypes.DECIMAL(18, 5),
      allowNull: false,
      defaultValue: 0,
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
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "KontragentPayModel",
    tableName: "kontragent_pay",
    timestamps: true,
    paranoid: true,
  }
);

module.exports = KontragentPayModel;
