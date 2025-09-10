"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Add 'etiketika_cost' column to the 'marked_costs' table
      await queryInterface.addColumn(
        "marked_costs", // table name
        "etiketika_cost", // new column name
        {
          type: Sequelize.DataTypes.DECIMAL(12, 5),
          allowNull: false,
          defaultValue: 0, // Default value for 'etiketika_cost'
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
      // Remove 'etiketika_cost' column from the 'marked_costs' table
      await queryInterface.removeColumn("marked_costs", "etiketika_cost", {
        transaction,
      });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
