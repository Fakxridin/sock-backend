"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const t = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        "food_shablon",
        "etiketika_qoldiq",
        {
          type: Sequelize.DataTypes.DECIMAL(12, 5),
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
      await queryInterface.removeColumn("food_shablon", "etiketika_qoldiq", {
        transaction: t,
      });
      await t.commit();
    } catch (err) {
      await t.rollback();
      throw err;
    }
  },
};
