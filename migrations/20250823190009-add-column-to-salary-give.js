"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        "salary_give", // table name
        "kassa_id",
        {
          type: Sequelize.DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "kassa",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        { transaction }
      );

      await queryInterface.addColumn(
        "salary_give", // table name
        "user_fullname",
        {
          type: Sequelize.DataTypes.STRING,
          allowNull: false,
        },
        { transaction }
      );

      await queryInterface.addColumn(
        "salary_give", // table name
        "kurs_summa",
        {
          type: Sequelize.DataTypes.DECIMAL(12, 5),
          allowNull: false,
          defaultValue: 0,
        },
        { transaction }
      );

      await queryInterface.addColumn(
        "salary_give", // table name
        "dollar_summa",
        {
          type: Sequelize.DataTypes.DECIMAL(12, 5),
          allowNull: false,
          defaultValue: 0,
        },
        { transaction }
      );

      await queryInterface.addColumn(
        "salary_give", // table name
        "som_summa",
        {
          type: Sequelize.DataTypes.DECIMAL(12, 5),
          allowNull: false,
          defaultValue: 0,
        },
        { transaction }
      );

      await queryInterface.addColumn(
        "salary_give", // table name
        "total_dollar_summa",
        {
          type: Sequelize.DataTypes.DECIMAL(12, 5),
          allowNull: false,
          defaultValue: 0,
        },
        { transaction }
      );

      await queryInterface.addColumn(
        "salary_give", // table name
        "total_som_summa",
        {
          type: Sequelize.DataTypes.DECIMAL(12, 5),
          allowNull: false,
          defaultValue: 0,
        },
        { transaction }
      );

      // Add the comment column
      await queryInterface.addColumn(
        "salary_give", // table name
        "comment",
        {
          type: Sequelize.DataTypes.STRING,
          allowNull: true,
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
      // Remove the columns if we roll back
      await queryInterface.removeColumn("salary_give", "kassa_id", {
        transaction,
      });
      await queryInterface.removeColumn("salary_give", "user_fullname", {
        transaction,
      });
      await queryInterface.removeColumn("salary_give", "kurs_summa", {
        transaction,
      });
      await queryInterface.removeColumn("salary_give", "dollar_summa", {
        transaction,
      });
      await queryInterface.removeColumn("salary_give", "som_summa", {
        transaction,
      });
      await queryInterface.removeColumn("salary_give", "total_dollar_summa", {
        transaction,
      });
      await queryInterface.removeColumn("salary_give", "total_som_summa", {
        transaction,
      });

      // Remove the comment column
      await queryInterface.removeColumn("salary_give", "comment", {
        transaction,
      });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
