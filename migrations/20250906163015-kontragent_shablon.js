"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const t = await queryInterface.sequelize.transaction();
    try {
      // 1) kontragent_shablon
      await queryInterface.createTable(
        "kontragent_shablon",
        {
          id: {
            type: Sequelize.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
          },

          user_name: {
            type: Sequelize.DataTypes.STRING(191),
            allowNull: false,
          },
          kontragent_id: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false,
            references: { model: "kontragent", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
          },
          user_id: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false,
            references: { model: "user", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
          },
          type: {
            // enum: give | take
            type: Sequelize.DataTypes.ENUM("give", "take"),
            allowNull: false,
          },
          total_summa: {
            type: Sequelize.DataTypes.DECIMAL(14, 2),
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

      // 2) kontragent_shablon_products
      await queryInterface.createTable(
        "kontragent_shablon_products",
        {
          id: {
            type: Sequelize.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
          },
          kontragent_shablon_id: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false,
            references: { model: "kontragent_shablon", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
          },
          // If your "shablon" lives in `food_shablon`, we can still name the FK column
          // `shablon_id` but reference the `food_shablon` table:
          shablon_id: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false,
            references: { model: "food_shablon", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
          },
          miqdor: {
            type: Sequelize.DataTypes.DECIMAL(12, 2),
            allowNull: false,
          },
          narx: {
            type: Sequelize.DataTypes.DECIMAL(12, 2),
            allowNull: false,
          },
          summa: {
            type: Sequelize.DataTypes.DECIMAL(14, 2),
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

      // Helpful indexes
      await queryInterface.addIndex(
        "kontragent_shablon",
        ["kontragent_id", "type"],
        { name: "idx_kontragent_shablon_kontragent_type", transaction: t }
      );
      await queryInterface.addIndex(
        "kontragent_shablon_products",
        ["kontragent_shablon_id"],
        { name: "idx_ksp_shablon_id", transaction: t }
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
      await queryInterface.dropTable("kontragent_shablon_products", {
        transaction: t,
      });
      await queryInterface.dropTable("kontragent_shablon", {
        transaction: t,
      });

      // If you are on Postgres and need to clean up ENUM type explicitly:
      // await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_kontragent_shablon_type";', { transaction: t });

      await t.commit();
    } catch (err) {
      await t.rollback();
      throw err;
    }
  },
};
