"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // come_time
      await queryInterface.addColumn(
        "worker_attendances",
        "come_time",
        {
          type: DataTypes.TIME,
          allowNull: true,
        },
        { transaction }
      );

      // left_time
      await queryInterface.addColumn(
        "worker_attendances",
        "left_time",
        {
          type: DataTypes.TIME,
          allowNull: true,
        },
        { transaction }
      );

      // worked_minutes
      await queryInterface.addColumn(
        "worker_attendances",
        "worked_minutes",
        {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        { transaction }
      );

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn("worker_attendances", "come_time", {
        transaction,
      });

      await queryInterface.removeColumn("worker_attendances", "left_time", {
        transaction,
      });

      await queryInterface.removeColumn(
        "worker_attendances",
        "worked_minutes",
        { transaction }
      );

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
