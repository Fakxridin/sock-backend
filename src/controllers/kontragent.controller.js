const KontragentModel = require("../models/kontragent.model");
const HttpException = require("../utils/HttpException.utils");
const BaseController = require("./BaseController");

class KontragentController extends BaseController {
  getAll = async (req, res, next) => {
    const kontragents = await KontragentModel.findAll({
      order: [["fullname", "ASC"]],
    });
    res.send(kontragents);
  };

  getById = async (req, res, next) => {
    const kontragent = await KontragentModel.findOne({
      where: { id: req.params.id },
    });

    if (!kontragent) {
      throw new HttpException(404, req.mf("data not found"));
    }

    res.send(kontragent);
  };

  create = async (req, res, next) => {
    this.checkValidation(req);

    const { fullname, phone_number, comment, balance, dollar_balance } =
      req.body;

    const kontragent = await KontragentModel.create({
      fullname,
      phone_number,
      comment,
      balance,
      dollar_balance,
    });

    if (!kontragent) {
      throw new HttpException(500, req.mf("Something went wrong"));
    }

    res.status(201).send(kontragent);
  };

  update = async (req, res, next) => {
    this.checkValidation(req);

    const kontragent = await KontragentModel.findOne({
      where: { id: req.params.id },
    });

    if (!kontragent) {
      throw new HttpException(404, req.mf("data not found"));
    }

    const { fullname, phone_number, comment, dollar_balance, balance } =
      req.body;

    kontragent.fullname = fullname;
    kontragent.phone_number = phone_number;
    kontragent.comment = comment;
    kontragent.dollar_balance = dollar_balance;

    if (balance !== undefined) {
      kontragent.balance = balance;
    }
    if (dollar_balance !== undefined) {
      kontragent.dollar_balance = dollar_balance;
    }

    await kontragent.save();

    res.send(kontragent);
  };
  // payment = async (req, res, next) => {
  //   this.checkValidation(req);

  //   const { kontragent_id, amount } = req.body;

  //   if (!kontragent_id) {
  //     throw new HttpException(400, req.mf("kontragent_id is required"));
  //   }

  //   if (amount <= 0) {
  //     throw new HttpException(400, req.mf("amount must be greater than zero"));
  //   }

  //   const kontragent = await KontragentModel.findByPk(kontragent_id);
  //   if (!kontragent) {
  //     throw new HttpException(404, req.mf("data not found"));
  //   }

  //   if (kontragent.balance < amount) {
  //     throw new HttpException(400, req.mf("insufficient balance"));
  //   }

  //   kontragent.balance -= amount;
  //   await kontragent.save();

  //   res.send(kontragent);
  // };

  delete = async (req, res, next) => {
    const kontragent = await KontragentModel.findOne({
      where: { id: req.params.id },
    });

    if (!kontragent) {
      throw new HttpException(404, req.mf("data not found"));
    }

    try {
      await kontragent.destroy({ force: true });
    } catch (error) {
      await kontragent.destroy();
    }

    res.send(req.mf("data has been deleted"));
  };
}

module.exports = new KontragentController();
