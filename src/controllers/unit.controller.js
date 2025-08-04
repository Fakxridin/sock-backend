const UnitModel = require('../models/unit.model');
const HttpException = require('../utils/HttpException.utils');
const BaseController = require('./BaseController');

/******************************************************************************
 *                              Unit Controller
 ******************************************************************************/
class UnitController extends BaseController {
    getAll = async (req, res, next) => {
        const units = await UnitModel.findAll({
            order: [['name', 'ASC']]
        });
        res.send(units);
    };

    getById = async (req, res, next) => {
        const unit = await UnitModel.findOne({
            where: { id: req.params.id }
        });

        if (!unit) {
            throw new HttpException(404, req.mf('data not found'));
        }

        res.send(unit);
    };

    create = async (req, res, next) => {
        this.checkValidation(req);

        const { name } = req.body;

        const unit = await UnitModel.create({ name });

        if (!unit) {
            throw new HttpException(500, req.mf('Something went wrong'));
        }

        res.status(201).send(unit);
    };

    update = async (req, res, next) => {
        this.checkValidation(req);

        const unit = await UnitModel.findOne({ where: { id: req.params.id } });

        if (!unit) {
            throw new HttpException(404, req.mf('data not found'));
        }

        unit.name = req.body.name;
        await unit.save();

        res.send(unit);
    };

    delete = async (req, res, next) => {
        const unit = await UnitModel.findOne({ where: { id: req.params.id } });

        if (!unit) {
            throw new HttpException(404, req.mf('data not found'));
        }

        try {
            await unit.destroy({ force: true }); // hard delete
        } catch (error) {
            await unit.destroy(); // soft delete fallback
        }

        res.send(req.mf('data has been deleted'));
    };
}

/******************************************************************************
 *                               Export
 ******************************************************************************/
module.exports = new UnitController();
