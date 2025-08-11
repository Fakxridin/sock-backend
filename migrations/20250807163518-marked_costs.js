"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // 1) Jadvalni yaratish, default qiymatlarni 0 qilib qo‘yamiz
      await queryInterface.createTable(
        "marked_costs",
        {
          id: {
            type: Sequelize.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
          },
          tikish_cost: {
            type: Sequelize.DataTypes.DECIMAL(12, 5),
            allowNull: false,
            defaultValue: 0,
          },
          averlo_cost: {
            type: Sequelize.DataTypes.DECIMAL(12, 5),
            allowNull: false,
            defaultValue: 0,
          },
          dazmol_cost: {
            type: Sequelize.DataTypes.DECIMAL(12, 5),
            allowNull: false,
            defaultValue: 0,
          },
          upakovka_cost: {
            type: Sequelize.DataTypes.DECIMAL(12, 5),
            allowNull: false,
            defaultValue: 0,
          },
          createdAt: {
            type: Sequelize.DataTypes.DATE,
            allowNull: false,
          },
          updatedAt: {
            type: Sequelize.DataTypes.DATE,
            allowNull: false,
          },
          deletedAt: {
            type: Sequelize.DataTypes.DATE,
            allowNull: true,
          },
        },
        { transaction }
      );

      await queryInterface.bulkInsert(
        "marked_costs",
        [
          {
            tikish_cost: 100,
            averlo_cost: 100,
            dazmol_cost: 100,
            upakovka_cost: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
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
      await queryInterface.dropTable("marked_costs", { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
