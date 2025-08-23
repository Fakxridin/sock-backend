"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable(
        "kassa",
        {
          id: {
            autoIncrement: true,
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
          },

          // FK o'rniga oddiy matn
          user_fullname: {
            type: Sequelize.DataTypes.STRING(100),
            allowNull: false,
          },

          kurs_summa: {
            type: Sequelize.DataTypes.DECIMAL(18, 5),
            allowNull: false,
            defaultValue: 0,
          },
          som_summa: {
            type: Sequelize.DataTypes.DECIMAL(18, 5),
            allowNull: false,
            defaultValue: 0,
          },
          dollar_summa: {
            type: Sequelize.DataTypes.DECIMAL(18, 5),
            allowNull: false,
            defaultValue: 0,
          },
          type: {
            type: Sequelize.DataTypes.BOOLEAN,
            allowNull: false,
          },
          doc_type: {
            type: Sequelize.DataTypes.STRING(30),
            allowNull: false,
          },
          total_dollar_summa: {
            type: Sequelize.DataTypes.DECIMAL(18, 5),
            allowNull: false,
            defaultValue: 0,
          },
          total_som_summa: {
            type: Sequelize.DataTypes.DECIMAL(18, 5),
            allowNull: false,
            defaultValue: 0,
          },
          comment: {
            type: Sequelize.DataTypes.STRING(255),
            allowNull: true,
          },
          createdAt: {
            type: Sequelize.DataTypes.DATE,
            allowNull: false,
            defaultValue: Sequelize.fn("NOW"),
          },
          updatedAt: {
            type: Sequelize.DataTypes.DATE,
            allowNull: false,
            defaultValue: Sequelize.fn("NOW"),
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
      await queryInterface.dropTable("kassa", { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
