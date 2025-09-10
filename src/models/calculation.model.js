const { DataTypes, Model } = require("sequelize");
const sequelize = require("../db/db-sequelize");

class FoodShablonModel extends Model {}

FoodShablonModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    total_spent: {
      type: DataTypes.DECIMAL(12, 5),
      allowNull: false,
      defaultValue: 0,
    },
    selling_price: {
      type: DataTypes.DECIMAL(12, 5),
      allowNull: false,
      defaultValue: 0,
    },
    selling_price_som: {
      type: DataTypes.DECIMAL(12, 5),
      allowNull: false,
      defaultValue: 0,
    },
    total_spent_som: {
      type: DataTypes.DECIMAL(12, 5),
      allowNull: false,
      defaultValue: 0,
    },
    kurs_summa: {
      type: DataTypes.DECIMAL(12, 5),
      allowNull: false,
      defaultValue: 0,
    },
    qoldiq: {
      type: DataTypes.DECIMAL(12, 5),
      allowNull: false,
      defaultValue: 0,
    },
    sklad1_qoldiq: {
      type: DataTypes.DECIMAL(12, 5),
      allowNull: false,
      defaultValue: 0,
    },
    sklad2_qoldiq: {
      type: DataTypes.DECIMAL(12, 5),
      allowNull: false,
      defaultValue: 0,
    },
    bishish_qoldiq: {
      type: DataTypes.DECIMAL(12, 5),
      allowNull: false,
      defaultValue: 0,
    },
    averlo_qoldiq: {
      type: DataTypes.DECIMAL(12, 5),
      allowNull: false,
      defaultValue: 0,
    },
    dazmol_qoldiq: {
      type: DataTypes.DECIMAL(12, 5),
      allowNull: false,
      defaultValue: 0,
    },
    etiketika_qoldiq: {
      type: DataTypes.DECIMAL(12, 5),
      allowNull: false,
      defaultValue: 0,
    },
    // New field for image name
    img_name: {
      type: DataTypes.STRING(255),
      allowNull: true, // Assuming it's optional
    },
  },
  {
    sequelize,
    modelName: "FoodShablonModel",
    tableName: "food_shablon",
    timestamps: true,
    paranoid: true,
  }
);

module.exports = FoodShablonModel;
