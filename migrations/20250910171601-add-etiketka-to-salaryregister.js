"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Adding 'etiketika_soni' column to the 'salary_registers' table
      await queryInterface.addColumn(
        "salary_registers", // table name
        "etiketika_soni", // new column name
        {
          type: Sequelize.DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0, // Default value, can be adjusted as needed
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
      // Removing 'etiketika_soni' column from the 'salary_registers' table
      await queryInterface.removeColumn("salary_registers", "etiketika_soni", {
        transaction,
      });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
