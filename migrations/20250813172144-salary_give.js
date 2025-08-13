"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Salary Give table
      await queryInterface.createTable(
        "salary_give", // table name
        {
          id: {
            type: Sequelize.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
          },
          worker_id: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false,
            references: {
              model: "workers", // Reference to workers table
              key: "id",
            },
            onDelete: "CASCADE", // Deleting worker will delete related records
          },
          summa: {
            type: Sequelize.DataTypes.DECIMAL(12, 5),
            allowNull: false,
            defaultValue: 0,
          },
          datetime: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false, // Store Unix timestamp
          },
          createdAt: Sequelize.DataTypes.DATE,
          updatedAt: Sequelize.DataTypes.DATE,
          deletedAt: Sequelize.DataTypes.DATE,
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
      await queryInterface.dropTable("salary_give", { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
