"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        "product",
        "sklad1_qoldiq",
        {
          type: Sequelize.DataTypes.DECIMAL(12, 2),
          allowNull: false,
          defaultValue: 0,
        },
        { transaction }
      );

      await queryInterface.addColumn(
        "product",
        "sklad2_qoldiq",
        {
          type: Sequelize.DataTypes.DECIMAL(12, 2),
          allowNull: false,
          defaultValue: 0,
        },
        { transaction }
      );

      await queryInterface.addColumn(
        "product",
        "min_amount1",
        {
          type: Sequelize.DataTypes.DECIMAL(12, 2),
          allowNull: false,
          defaultValue: 0,
        },
        { transaction }
      );

      await queryInterface.addColumn(
        "product",
        "min_amount2",
        {
          type: Sequelize.DataTypes.DECIMAL(12, 2),
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
      await queryInterface.removeColumn("product", "sklad1_qoldiq", {
        transaction,
      });
      await queryInterface.removeColumn("product", "sklad2_qoldiq", {
        transaction,
      });
      await queryInterface.removeColumn("product", "min_amount1", {
        transaction,
      });
      await queryInterface.removeColumn("product", "min_amount2", {
        transaction,
      });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
