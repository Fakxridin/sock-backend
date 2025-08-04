"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Kontragent table
      await queryInterface.createTable(
        "kontragent",
        {
          id: {
            type: Sequelize.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
          },
          fullname: {
            type: Sequelize.DataTypes.STRING(100),
            allowNull: false,
          },
          phone_number: {
            type: Sequelize.DataTypes.STRING(20),
            allowNull: true,
          },
          comment: {
            type: Sequelize.DataTypes.TEXT,
            allowNull: true,
          },
          balance: {
            type: Sequelize.DataTypes.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0,
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
      await queryInterface.dropTable("kontragent", { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
