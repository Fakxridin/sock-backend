"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const t = await queryInterface.sequelize.transaction();
    try {
      // 2) food_shablon (with category_id)
      await queryInterface.createTable(
        "food_shablon",
        {
          id: {
            type: Sequelize.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
          },
          name: {
            type: Sequelize.DataTypes.STRING(100),
            allowNull: false,
          },
          total_spent: {
            type: Sequelize.DataTypes.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0,
          },
          selling_price: {
            type: Sequelize.DataTypes.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0,
          },
          qoldiq: {
            type: Sequelize.DataTypes.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0,
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

      // 3) needed_products
      await queryInterface.createTable(
        "needed_products",
        {
          id: {
            type: Sequelize.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
          },
          food_shablon_id: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false,
            references: { model: "food_shablon", key: "id" },
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
          miqdor: {
            type: Sequelize.DataTypes.DECIMAL(12, 5),
            allowNull: false,
          },
          summa: {
            type: Sequelize.DataTypes.DECIMAL(12, 5),
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
      await queryInterface.dropTable("needed_products", { transaction: t });
      await queryInterface.dropTable("food_shablon", { transaction: t });
      await t.commit();
    } catch (err) {
      await t.rollback();
      throw err;
    }
  },
};
