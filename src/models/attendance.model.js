const { DataTypes, Model } = require("sequelize");
const sequelize = require("../db/db-sequelize");
const WorkerModel = require("./worker.model");

class WorkerAttendanceModel extends Model {}

WorkerAttendanceModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    worker_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: WorkerModel,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    is_present: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "WorkerAttendanceModel",
    tableName: "worker_attendances",
    timestamps: true,
    paranoid: true,
  }
);

module.exports = WorkerAttendanceModel;
