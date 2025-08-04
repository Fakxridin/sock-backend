"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const t = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        "food_shablon",
        "sklad1_qoldiq",
        {
          type: Sequelize.DataTypes.DECIMAL(12, 2),
          allowNull: false,
          defaultValue: 0,
        },
        { transaction: t }
      );

      await queryInterface.addColumn(
        "food_shablon",
        "sklad2_qoldiq",
        {
          type: Sequelize.DataTypes.DECIMAL(12, 2),
          allowNull: false,
          defaultValue: 0,
        },
        { transaction: t }
      );

      await t.commit();
    } catch (err) {
      await t.rollback();
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    const t = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn("food_shablon", "sklad1_qoldiq", {
        transaction: t,
      });

      await queryInterface.removeColumn("food_shablon", "sklad2_qoldiq", {
        transaction: t,
      });

      await t.commit();
    } catch (err) {
      await t.rollback();
      throw err;
    }
  },
};
