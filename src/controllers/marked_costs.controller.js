// controllers/MarkedCostController.js

const MarkedCostModel = require("../models/marked_cost.model");
const HttpException = require("../utils/HttpException.utils");
const BaseController = require("./BaseController");

class MarkedCostController extends BaseController {
  // GET /marked_costs/:id
  getById = async (req, res, next) => {
    const record = await MarkedCostModel.findOne({
      where: { id: req.params.id },
    });
    if (!record) {
      throw new HttpException(404, req.mf("data not found"));
    }
    res.send(record);
  };

  // PUT /marked_costs/:id
  update = async (req, res, next) => {
    this.checkValidation(req);

    const record = await MarkedCostModel.findOne({
      where: { id: req.params.id },
    });
    if (!record) {
      throw new HttpException(404, req.mf("data not found"));
    }

    const { tikish_cost, averlo_cost, dazmol_cost, upakovka_cost } = req.body;

    if (tikish_cost !== undefined) record.tikish_cost = tikish_cost;
    if (averlo_cost !== undefined) record.averlo_cost = averlo_cost;
    if (dazmol_cost !== undefined) record.dazmol_cost = dazmol_cost;
    if (upakovka_cost !== undefined) record.upakovka_cost = upakovka_cost;

    await record.save();
    res.send(record);
  };
}

module.exports = new MarkedCostController();
