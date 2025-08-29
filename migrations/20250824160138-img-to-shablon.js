"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const t = await queryInterface.sequelize.transaction();
    try {
      // 1) Add img_name column to food_shablon
      await queryInterface.addColumn(
        "food_shablon", // table name
        "img_name",
        {
          type: Sequelize.DataTypes.STRING(255),
          allowNull: true, // Assuming it's optional
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
      // 2) Remove img_name column from food_shablon if rolling back
      await queryInterface.removeColumn(
        "food_shablon", // table name
        "img_name", // column name to remove
        { transaction: t }
      );

      await t.commit();
    } catch (err) {
      await t.rollback();
      throw err;
    }
  },
};
