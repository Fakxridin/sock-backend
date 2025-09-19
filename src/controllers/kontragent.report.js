const { Op, Sequelize } = require("sequelize");
const {
  KontragentModel,
  PrixodModel,
  PrixodTableModel,
  KontragentShablonModel,
  KontragentPayModel,
} = require("../models/index");

const getKontragentReport = async (req, res) => {
  try {
    const { start_date, end_date } = req.body;
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    const kontragents = await KontragentModel.findAll({
      attributes: [
        "id",
        "fullname",
        "phone_number",
        "balance",
        [
          Sequelize.fn("SUM", Sequelize.col("prixodEntries.total_cost")),
          "kontragent_prixod_total",
        ],
        [
          Sequelize.fn(
            "SUM",
            Sequelize.literal(
              `CASE WHEN shablonlar.type = 'take' THEN shablonlar.total_summa ELSE 0 END`
            )
          ),
          "kontragent_shablon_take_total",
        ],
        [
          Sequelize.fn(
            "SUM",
            Sequelize.literal(
              `CASE WHEN shablonlar.type = 'give' THEN shablonlar.total_summa ELSE 0 END`
            )
          ),
          "kontragent_shablon_give_total",
        ],
        [
          Sequelize.fn(
            "SUM",
            Sequelize.col("kontragentPays.total_dollar_summa")
          ),
          "kontragent_pay_total",
        ],
      ],
      include: [
        {
          model: PrixodTableModel,
          as: "prixodEntries",
          required: false,
          attributes: [],
          where: {
            createdAt: { [Op.between]: [startDate, endDate] },
          },
        },
        {
          model: KontragentShablonModel,
          as: "shablonlar",
          required: false,
          attributes: [],
          where: {
            createdAt: { [Op.between]: [startDate, endDate] },
          },
        },
        {
          model: KontragentPayModel,
          as: "kontragentPays", // Add this alias to your association if missing
          required: false,
          attributes: [],
          where: {
            createdAt: { [Op.between]: [startDate, endDate] },
          },
        },
      ],
      group: ["KontragentModel.id"],
      raw: true, // Helps with complex aggregations
    });

    // Format the result to send as response
    const response = kontragents.map((kontragent) => ({
      kontragent_id: kontragent.id,
      kontragent_fullname: kontragent.fullname, // Now including fullname
      kontragent_phone: kontragent.phone_number || "—",
      kontragent_balance: kontragent.balance,
      kontragent_prixod_total: konverter(kontragent.kontragent_prixod_total),
      kontragent_shablon_take_total: konverter(
        kontragent.kontragent_shablon_take_total
      ),
      kontragent_shablon_give_total: konverter(
        kontragent.kontragent_shablon_give_total
      ),
      kontragent_pay_total: konverter(kontragent.kontragent_pay_total),
    }));

    res.json({ kontragents: response });
  } catch (error) {
    console.error("Error fetching kontragent report:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Helper function to safely convert numbers to a currency format
const konverter = (value) => {
  return value ? value.toFixed(2) : "0.00";
};

module.exports = { getKontragentReport };
