"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable(
        "user",
        {
          id: {
            type: Sequelize.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
          },
          username: {
            type: Sequelize.DataTypes.STRING(25),
            allowNull: false,
            unique: true,
          },
          password: {
            type: Sequelize.DataTypes.STRING(60),
            allowNull: false,
          },
          fullname: {
            type: Sequelize.DataTypes.STRING(50),
            allowNull: false,
          },
          role: {
            type: Sequelize.DataTypes.ENUM(
              "Admin",
              "Menejer",
              "Master",
              "Programmist",
              "Skladchi",
              "Hodim"
            ),
            allowNull: true,
            defaultValue: "Menejer",
          },
          createdAt: {
            type: Sequelize.DataTypes.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
          },
          updatedAt: {
            type: Sequelize.DataTypes.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
          },
          deletedAt: {
            type: Sequelize.DataTypes.DATE,
            allowNull: true,
          },
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
      await queryInterface.dropTable("user", { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
