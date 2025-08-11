const KursModel = require("../models/kurs.model");
const HttpException = require("../utils/HttpException.utils");
const BaseController = require("./BaseController");
const { Op } = require("sequelize");
class KursController extends BaseController {
  // GET /kurs
  getAll = async (req, res, next) => {
    const list = await KursModel.findAll({
      order: [["id", "ASC"]],
    });
    res.send(list);
  };

  // GET /kurs/:id
  getById = async (req, res, next) => {
    const kurs = await KursModel.findByPk(req.params.id);
    if (!kurs) {
      throw new HttpException(404, req.mf("data not found"));
    }
    res.send(kurs);
  };

  // POST /kurs
  create = async (req, res, next) => {
    this.checkValidation(req);

    const { summa } = req.body;
    if (summa === undefined) {
      throw new HttpException(400, req.mf("summa is required"));
    }

    const kurs = await KursModel.create({ summa });
    if (!kurs) {
      throw new HttpException(500, req.mf("Something went wrong"));
    }

    res.status(201).send(kurs);
  };

  // PUT /kurs/:id
  update = async (req, res, next) => {
    this.checkValidation(req);

    const kurs = await KursModel.findByPk(req.params.id);
    if (!kurs) {
      throw new HttpException(404, req.mf("data not found"));
    }

    const { summa } = req.body;
    if (summa !== undefined) {
      kurs.summa = summa;
    }

    await kurs.save();
    res.send(kurs);
  };

  // DELETE /kurs/:id
  delete = async (req, res, next) => {
    const kurs = await KursModel.findByPk(req.params.id);
    if (!kurs) {
      throw new HttpException(404, req.mf("data not found"));
    }

    await kurs.destroy({ force: true });
    res.send(req.mf("data has been deleted"));
  };
  filterByDate = async (req, res, next) => {
    const { from, to } = req.body;
    if (!from || !to) {
      throw new HttpException(
        400,
        req.mf("from va to parametrlarini yuboring")
      );
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);
    if (isNaN(fromDate) || isNaN(toDate)) {
      throw new HttpException(400, req.mf("Sana formati noto‘g‘ri"));
    }

    const kurslar = await KursModel.findAll({
      where: {
        createdAt: {
          [Op.between]: [fromDate, toDate],
        },
      },
      order: [["createdAt", "ASC"]],
    });

    res.send(kurslar);
  };
  latest = async (req, res, next) => {
    // Найти одну запись, упорядочив по дате создания DESC
    const kurs = await KursModel.findOne({
      order: [["createdAt", "DESC"]],
    });
    if (!kurs) {
      throw new HttpException(404, req.mf("data not found"));
    }
    res.send(kurs);
  };
}

module.exports = new KursController();
