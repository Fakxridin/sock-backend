const { DataTypes, Model } = require("sequelize");
const sequelize = require("../db/db-sequelize");
const UnitModel = require("./unit.model");

class ProductModel extends Model {}

ProductModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    narx: {
      type: DataTypes.DECIMAL(12, 5),
      allowNull: false,
      defaultValue: 0,
    },
    dollar_narx: {
      type: DataTypes.DECIMAL(12, 5),
      allowNull: false,
      defaultValue: 0,
    },

    qoldiq: {
      type: DataTypes.DECIMAL(12, 5),
      allowNull: false,
      defaultValue: 0,
    },
    unit_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "unit",
        key: "id",
      },
    },

    // ✅ Yangi qo‘shilgan ustunlar
    sklad1_qoldiq: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    sklad2_qoldiq: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    min_amount1: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    min_amount2: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: "ProductModel",
    tableName: "product",
    timestamps: true,
    paranoid: true,
  }
);

// Association

module.exports = ProductModel;
