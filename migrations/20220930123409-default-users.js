"use strict";

const sequelize = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.bulkInsert(
        "user",
        [
          {
            username: "faxriddin123",
            password:
              "$2a$08$YLZ7gtHc5KgiF3TlX/12r.boof4dIvGSoViUYxaRL8f7yHhKjPh0i",
            fullname: "Fahriddin Umarov",
            role: "Programmist",
            deletedAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            username: "Admin",
            password:
              "$2a$08$YLZ7gtHc5KgiF3TlX/12r.boof4dIvGSoViUYxaRL8f7yHhKjPh0i",
            fullname: "Admin",
            role: "Admin",
            deletedAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            username: "Menejer",
            password:
              "$2a$08$YLZ7gtHc5KgiF3TlX/12r.boof4dIvGSoViUYxaRL8f7yHhKjPh0i",
            fullname: "Manager User",
            role: "Menejer",
            deletedAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        { transaction }
      );

      await queryInterface.sequelize.query(
        "ALTER TABLE user AUTO_INCREMENT = 5",
        {
          type: Sequelize.QueryTypes.UPDATE,
          transaction,
        }
      );

      await transaction.commit();
    } catch (errors) {
      await transaction.rollback();
      throw errors;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.bulkDelete(
        "user",
        {
          username: [
            "Programmer",
            "Admin",
            "Menejer",
            "Master",
            "Hodim",
            "Skladchi",
          ],
        },
        { transaction }
      );

      await transaction.commit();
    } catch (errors) {
      await transaction.rollback();
      throw errors;
    }
  },
};
