const { DataTypes, Model } = require('sequelize');
const sequelize = require('../db/db-sequelize');

class UnitModel extends Model { }

UnitModel.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: true
    }
}, {
    sequelize,
    modelName: 'UnitModel',
    tableName: 'unit',
    timestamps: true,
    paranoid: true
});

module.exports = UnitModel;
