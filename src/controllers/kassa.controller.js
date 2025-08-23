const KassaModel = require("../models/kassa.model");
const HttpException = require("../utils/HttpException.utils");
const BaseController = require("./BaseController");

/******************************************************************************
 *                               Kassa Controller
 ******************************************************************************/
class KassaController extends BaseController {
  // GET /kassa
  getAll = async (req, res, next) => {
    const kassas = await KassaModel.findAll({
      order: [["createdAt", "DESC"]],
    });

    res.send(kassas);
  };

  // GET /kassa/:id
  getById = async (req, res, next) => {
    const kassa = await KassaModel.findOne({
      where: { id: req.params.id },
    });

    if (!kassa) {
      throw new HttpException(404, req.mf("data not found"));
    }

    res.send(kassa);
  };

  // POST /kassa
  create = async (req, res, next) => {
    this.checkValidation(req);

    const {
      user_fullname,
      kurs_summa,
      som_summa,
      dollar_summa,
      type, // boolean
      doc_type, // string
      total_dollar_summa,
      total_som_summa,
      comment,
    } = req.body;

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
      throw new HttpException(500, req.mf("Something went wrong"));
    }

    res.status(201).send(kassa);
  };

  // PUT /kassa/:id
  update = async (req, res, next) => {
    this.checkValidation(req);

    const kassa = await KassaModel.findOne({
      where: { id: req.params.id },
    });

    if (!kassa) {
      throw new HttpException(404, req.mf("data not found"));
    }

    const {
      user_fullname,
      kurs_summa,
      som_summa,
      dollar_summa,
      type,
      doc_type,
      total_dollar_summa,
      total_som_summa,
      comment,
    } = req.body;

    kassa.user_fullname = user_fullname;
    kassa.kurs_summa = kurs_summa;
    kassa.som_summa = som_summa;
    kassa.dollar_summa = dollar_summa;
    kassa.type = type;
    kassa.doc_type = doc_type;
    kassa.total_dollar_summa = total_dollar_summa;
    kassa.total_som_summa = total_som_summa;
    kassa.comment = comment;

    await kassa.save();

    res.send(kassa);
  };

  // DELETE /kassa/:id
  delete = async (req, res, next) => {
    const kassa = await KassaModel.findOne({
      where: { id: req.params.id },
    });

    if (!kassa) {
      throw new HttpException(404, req.mf("data not found"));
    }

    try {
      await kassa.destroy({ force: true }); // hard delete
    } catch (error) {
      await kassa.destroy(); // soft delete fallback (paranoid true bo'lsa)
    }

    res.send(req.mf("data has been deleted"));
  };
}

/******************************************************************************
 *                               Export
 ******************************************************************************/
module.exports = new KassaController();
