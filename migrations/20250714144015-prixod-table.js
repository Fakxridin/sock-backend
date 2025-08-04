"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable(
        "prixod",
        {
          id: {
            type: Sequelize.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
          },
          datetime: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false,
          },
          total_overall_cost: {
            type: Sequelize.DataTypes.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0,
          },
          rasxod_summa: {
            type: Sequelize.DataTypes.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0,
          },
          comment: {
            type: Sequelize.DataTypes.TEXT,
            allowNull: true,
          },
          createdAt: Sequelize.DataTypes.DATE,
          updatedAt: Sequelize.DataTypes.DATE,
          deletedAt: Sequelize.DataTypes.DATE,
        },
        { transaction }
      );

      await queryInterface.createTable(
        "prixod_table",
        {
          id: {
            type: Sequelize.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
          },
          prixod_id: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false,
            references: { model: "prixod", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
          },
          product_id: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false,
            references: { model: "product", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
          },
          kontragent_id: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false,
            references: { model: "kontragent", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
          },
          miqdor: {
            type: Sequelize.DataTypes.DECIMAL(12, 2),
            allowNull: false,
          },
          product_cost: {
            type: Sequelize.DataTypes.DECIMAL(12, 2),
            allowNull: false,
          },
          initial_cost: {
            type: Sequelize.DataTypes.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0,
          },
          total_cost: {
            type: Sequelize.DataTypes.DECIMAL(12, 2),
            allowNull: false,
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
      await queryInterface.dropTable("prixod_table", { transaction });
      await queryInterface.dropTable("prixod", { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
