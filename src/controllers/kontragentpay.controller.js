const KontragentPayModel = require("../models/kontragentpay.model");
const KassaModel = require("../models/kassa.model");
const KontragentModel = require("../models/kontragent.model"); // Add Kontragent model import
const HttpException = require("../utils/HttpException.utils");
const BaseController = require("./BaseController");

class KontragentPayController extends BaseController {
  // GET /kontragent-pay
  getAll = async (req, res, next) => {
    const kontragentPays = await KontragentPayModel.findAll({
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: KassaModel,
          // as: "kassa",
        },
        {
          model: KontragentModel,

          attributes: ["fullname"],
        },
      ],
    });

    res.send(kontragentPays);
  };

  // GET /kontragent-pay/:id
  getById = async (req, res, next) => {
    const kontragentPay = await KontragentPayModel.findOne({
      where: { id: req.params.id },
      include: [KassaModel],
    });

    if (!kontragentPay) {
      throw new HttpException(404, req.mf("data not found"));
    }

    res.send(kontragentPay);
  };

  // POST /kontragent-pay
  create = async (req, res, next) => {
    this.checkValidation(req);

    const {
      kontragent_id,
      user_fullname,
      kurs_summa,
      dollar_summa,
      som_summa,
      total_dollar_summa,
      total_som_summa,
      comment,
    } = req.body;

    const doc_type = "Kontragent To'lov"; // Constant doc_type value for Kontragent Pay
    const type = 0; // Type 0, indicating a payment

    // 1. Create Kassa record first
    const kassa = await KassaModel.create({
      user_fullname,
      kurs_summa,
      som_summa,
      dollar_summa,
      type,
      doc_type,
      total_dollar_summa,
      total_som_summa,
      comment,
    });

    if (!kassa) {
      throw new HttpException(500, req.mf("Something went wrong with Kassa"));
    }

    // 2. Create KontragentPay record with the Kassa ID
    const kontragentPay = await KontragentPayModel.create({
      kontragent_id,
      kassa_id: kassa.id, // Store the Kassa ID
      user_fullname,
      kurs_summa,
      dollar_summa,
      som_summa,
      total_dollar_summa,
      total_som_summa,
      comment,
    });

    if (!kontragentPay) {
      throw new HttpException(
        500,
        req.mf("Something went wrong with KontragentPay")
      );
    }

    // 4. Update Kontragent balance after the payment (only reduce by total_dollar_summa)
    const kontragent = await KontragentModel.findOne({
      where: { id: kontragent_id },
    });
    if (kontragent) {
      kontragent.balance -= total_dollar_summa; // Only decrease by total_dollar_summa
      await kontragent.save();
    }

    res.status(201).send(kontragentPay);
  };

  // PUT /kontragent-pay/:id
  update = async (req, res, next) => {
    this.checkValidation(req);

    // Fetch the existing KontragentPay record
    const kontragentPay = await KontragentPayModel.findOne({
      where: { id: req.params.id },
    });

    if (!kontragentPay) {
      throw new HttpException(404, req.mf("data not found"));
    }

    const {
      kontragent_id,
      kassa_id, // Ensure this is being passed correctly
      user_fullname,
      kurs_summa,
      dollar_summa,
      som_summa,
      total_dollar_summa,
      total_som_summa,
      comment,
    } = req.body;

    // Store the previous values to update Kassa and Kontragent balance correctly
    const previousTotalDollar = kontragentPay.total_dollar_summa;
    const previousTotalSom = kontragentPay.total_som_summa;

    // Update the KontragentPay record
    kontragentPay.kontragent_id = kontragent_id;
    kontragentPay.kassa_id = kassa_id; // Ensure kassa_id is updated
    kontragentPay.user_fullname = user_fullname;
    kontragentPay.kurs_summa = kurs_summa;
    kontragentPay.dollar_summa = dollar_summa;
    kontragentPay.som_summa = som_summa;
    kontragentPay.total_dollar_summa = total_dollar_summa;
    kontragentPay.total_som_summa = total_som_summa;
    kontragentPay.comment = comment;

    // Save updated KontragentPay record
    await kontragentPay.save();

    // Update the related Kassa record after modification
    const kassa = await KassaModel.findOne({ where: { id: kassa_id } });
    if (kassa) {
      // Fully update Kassa, not just the sums
      kassa.kurs_summa = kurs_summa;
      kassa.som_summa = som_summa;
      kassa.dollar_summa = dollar_summa;
      kassa.total_som_summa += total_som_summa - previousTotalSom;
      kassa.total_dollar_summa += total_dollar_summa - previousTotalDollar;
      kassa.comment = comment; // Keep the comment if needed

      // Save updated Kassa record
      await kassa.save();
    } else {
      throw new HttpException(404, req.mf("Kassa not found"));
    }

    // Update the Kontragent balance after modification (only adjust by total_dollar_summa)
    const kontragent = await KontragentModel.findOne({
      where: { id: kontragent_id },
    });
    if (kontragent) {
      kontragent.balance -= total_dollar_summa - previousTotalDollar; // Adjust balance by the difference in total_dollar_summa
      await kontragent.save();
    } else {
      throw new HttpException(404, req.mf("Kontragent not found"));
    }

    res.send(kontragentPay);
  };

  // DELETE /kontragent-pay/:id
  delete = async (req, res, next) => {
    const kontragentPay = await KontragentPayModel.findOne({
      where: { id: req.params.id },
    });

    if (!kontragentPay) {
      throw new HttpException(404, req.mf("data not found"));
    }

    try {
      // Remove the related Kassa totals first and delete Kassa record
      const kassa = await KassaModel.findOne({
        where: { id: kontragentPay.kassa_id },
      });
      if (kassa) {
        // Deduct the totals from Kassa before deleting
        kassa.total_som_summa -= kontragentPay.total_som_summa;
        kassa.total_dollar_summa -= kontragentPay.total_dollar_summa;

        // Perform the deletion of Kassa record
        await kassa.destroy({ force: true }); // hard delete the Kassa record
      }

      // Update the Kontragent balance after deletion (only revert the total_dollar_summa)
      const kontragent = await KontragentModel.findOne({
        where: { id: kontragentPay.kontragent_id },
      });
      if (kontragent) {
        kontragent.balance += kontragentPay.total_dollar_summa; // Revert the total_dollar_summa from the balance
        await kontragent.save();
      }

      // Perform the deletion of KontragentPay record
      await kontragentPay.destroy({ force: true }); // hard delete the KontragentPay record

      res.send(req.mf("data has been deleted"));
    } catch (error) {
      // Handle error and ensure a rollback if necessary
      await kontragentPay.destroy(); // Soft delete fallback (paranoid true)
      throw error; // Re-throw error for further handling
    }
  };
}

module.exports = new KontragentPayController();
