const { DataTypes, Model } = require("sequelize");
const sequelize = require("../db/db-sequelize");

class UserModel extends Model {
  toJSON() {
    let values = Object.assign({}, this.get());
    delete values.password;
    return values;
  }
}

UserModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING(25),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(60),
      allowNull: false,
    },
    fullname: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM(
        "Admin",
        "Menejer",
        "Master",
        "Programmist",
        "Skladchi",
        "Hodim"
      ),
      allowNull: true,
      defaultValue: "Menejer",
    },
    token: {
      type: DataTypes.VIRTUAL,
    },
  },
  {
    sequelize,
    modelName: "UserModel",
    tableName: "user",
    timestamps: true,
    paranoid: true,
  }
);

module.exports = UserModel;
