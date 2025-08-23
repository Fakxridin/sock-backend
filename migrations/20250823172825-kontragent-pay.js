"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable(
        "kontragent_pay",
        {
          id: {
            type: Sequelize.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
          },

          kontragent_id: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false,
            references: {
              model: "kontragent",
              key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
          },

          kassa_id: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false,
            references: {
              model: "kassa",
              key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
          },

          user_fullname: {
            type: Sequelize.DataTypes.STRING(100),
            allowNull: false,
          },
          kurs_summa: {
            type: Sequelize.DataTypes.DECIMAL(18, 5),
            allowNull: false,
            defaultValue: 0,
          },
          dollar_summa: {
            type: Sequelize.DataTypes.DECIMAL(18, 5),
            allowNull: false,
            defaultValue: 0,
          },
          som_summa: {
            type: Sequelize.DataTypes.DECIMAL(18, 5),
            allowNull: false,
            defaultValue: 0,
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
            type: Sequelize.DataTypes.TEXT,
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
      await queryInterface.dropTable("kontragent_pay", { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
