"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const t = await queryInterface.sequelize.transaction();
    try {
      // 1) transactions
      await queryInterface.createTable(
        "transactions",
        {
          id: {
            type: Sequelize.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
          },
          is_accepted: {
            type: Sequelize.DataTypes.ENUM("kutilmoqda", "tasdiq", "rad"),
            allowNull: false,
          },
          skladchi_id: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false,
            references: { model: "user", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
          },
          oluvchi_id: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false,
            references: { model: "user", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
          },
          qayerdan: {
            type: Sequelize.DataTypes.ENUM("Sklad1", "Sklad2"),
            allowNull: false,
          },
          qayerga: {
            type: Sequelize.DataTypes.ENUM("Sklad1", "Sklad2"),
            allowNull: false,
          },
          createdAt: {
            type: Sequelize.DataTypes.DATE,
            allowNull: false,
          },
          updatedAt: {
            type: Sequelize.DataTypes.DATE,
            allowNull: false,
          },
          deletedAt: {
            type: Sequelize.DataTypes.DATE,
            allowNull: true,
          },
        },
        { transaction: t }
      );

      // 2) transaction_products
      await queryInterface.createTable(
        "transaction_products",
        {
          id: {
            type: Sequelize.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
          },
          transaction_id: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false,
            references: { model: "transactions", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
          },
          product_id: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: true,
            references: { model: "product", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
          },
          food_shablon_id: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: true,
            references: { model: "food_shablon", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
          },
          miqdor: {
            type: Sequelize.DataTypes.DECIMAL(12, 2),
            allowNull: false,
          },
          createdAt: {
            type: Sequelize.DataTypes.DATE,
            allowNull: false,
          },
          updatedAt: {
            type: Sequelize.DataTypes.DATE,
            allowNull: false,
          },
          deletedAt: {
            type: Sequelize.DataTypes.DATE,
            allowNull: true,
          },
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
      await queryInterface.dropTable("transaction_products", {
        transaction: t,
      });
      await queryInterface.dropTable("transactions", { transaction: t });

      await t.commit();
    } catch (err) {
      await t.rollback();
      throw err;
    }
  },
};
