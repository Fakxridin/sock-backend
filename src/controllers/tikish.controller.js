const Decimal = require("decimal.js");
const TikishModel = require("../models/tikish.model");
const FoodShablonModel = require("../models/calculation.model");
const NeededProductModel = require("../models/needed-product.model");
const ProductModel = require("../models/product.model");
const WorkerModel = require("../models/worker.model");
const SalaryRegisterModel = require("../models/salary-register.model");
const HttpException = require("../utils/HttpException.utils");
const BaseController = require("./BaseController");
const MarkedCostModel = require("../models/marked_cost.model");
class TikishController extends BaseController {
  create = async (req, res, next) => {
    this.checkValidation(req);
    const { shablon_id, miqdor, worker_id, user_id } = req.body;

    const shablon = await FoodShablonModel.findByPk(shablon_id, {
      include: [{ model: NeededProductModel, as: "ingredients" }],
    });
    if (!shablon) throw new HttpException(404, "Shablon topilmadi");

    const transaction = await TikishModel.sequelize.transaction();

    try {
      // Ingredients miqdorlarini tekshirish
      for (const ing of shablon.ingredients) {
        const totalMiqdor = new Decimal(ing.miqdor).mul(miqdor);
        const product = await ProductModel.findByPk(ing.product_id);
        if (!product) throw new HttpException(404, `Mahsulot topilmadi`);

        if (new Decimal(product.sklad2_qoldiq).lt(totalMiqdor)) {
          throw new HttpException(
            400,
            `Yetarli mahsulot yo‘q: ${product.name}`
          );
        }

        product.sklad2_qoldiq = new Decimal(product.sklad2_qoldiq)
          .minus(totalMiqdor)
          .toNumber();
        await product.save({ transaction });
      }

      // Shablon qoldig'ini yangilash
      shablon.bishish_qoldiq = new Decimal(shablon.bishish_qoldiq || 0)
        .plus(miqdor)
        .toNumber();
      await shablon.save({ transaction });

      // Tikish yaratish
      const tikish = await TikishModel.create(
        { shablon_id, miqdor, worker_id, user_id },
        { transaction }
      );

      // Workerning `stanokdan_soni`ni yangilash
      const worker = await WorkerModel.findByPk(worker_id);
      if (worker) {
        worker.stanokdan_soni = new Decimal(worker.stanokdan_soni || 0)
          .plus(miqdor)
          .toNumber();
        await worker.save({ transaction });
      }

      // `SalaryRegisterModel`ga yozish (ishchi ma'lumotlarini saqlash)
      await SalaryRegisterModel.create(
        {
          worker_id: worker_id,
          tikish_soni: miqdor, // Tikish miqdori
          averlo_soni: 0, // Averlo miqdori
          upakovka_soni: 0, // Upakovka miqdori
          dazmol_soni: 0, // Dazmol miqdori
          datetime: Math.floor(Date.now() / 1000), // Unix timestamp
        },
        { transaction }
      );

      // Agar worker `is_fixed` false bo'lsa, `total_balance`ga `tikish_cost` qo'shish
      if (!worker.is_fixed) {
        // MarkedCostModel'dan tikish_costni olish
        const markedCost = await MarkedCostModel.findOne({
          where: { id: 1 }, // idni o'zgartirishingiz mumkin
        });

        if (!markedCost) {
          throw new HttpException(404, "MarkedCost topilmadi");
        }

        const tikishCost = new Decimal(markedCost.tikish_cost).mul(miqdor);

        // Workerga balansni qo‘shish
        worker.total_balance = new Decimal(worker.total_balance || 0)
          .plus(tikishCost)
          .toNumber();
        await worker.save({ transaction });
      }

      await transaction.commit();
      res.send(tikish);
    } catch (err) {
      await transaction.rollback();
      next(err);
    }
  };

  update = async (req, res, next) => {
    this.checkValidation(req);
    const tikish = await TikishModel.findByPk(req.params.id);
    if (!tikish) throw new HttpException(404, "Tikish topilmadi");

    const oldMiqdor = new Decimal(tikish.miqdor);
    const { shablon_id, miqdor, worker_id, user_id } = req.body;

    const shablon = await FoodShablonModel.findByPk(shablon_id, {
      include: [{ model: NeededProductModel, as: "ingredients" }],
    });
    if (!shablon) throw new HttpException(404, "Shablon topilmadi");

    const transaction = await TikishModel.sequelize.transaction();

    try {
      const diff = new Decimal(miqdor).minus(oldMiqdor);

      for (const ing of shablon.ingredients) {
        const delta = new Decimal(ing.miqdor).mul(diff);
        const product = await ProductModel.findByPk(ing.product_id);
        if (!product) throw new HttpException(404, "Mahsulot topilmadi");

        const currentQoldiq = new Decimal(product.sklad2_qoldiq || 0);
        if (delta.gt(0) && currentQoldiq.lt(delta)) {
          throw new HttpException(
            400,
            `Yetarli mahsulot yo‘q: ${product.name}`
          );
        }

        product.sklad2_qoldiq = currentQoldiq.minus(delta).toNumber();
        await product.save({ transaction });
      }

      // Shablon qoldig‘ini yangilash
      shablon.bishish_qoldiq = new Decimal(shablon.bishish_qoldiq || 0)
        .plus(miqdor) // yoki .minus(tikish.miqdor) delete'da
        .toNumber();
      await shablon.save({ transaction });

      // Workerni yangilash
      const worker = await WorkerModel.findByPk(worker_id);
      if (worker) {
        worker.stanokdan_soni = new Decimal(worker.stanokdan_soni || 0)
          .plus(diff)
          .toNumber();
        await worker.save({ transaction });

        // `SalaryRegisterModel`ga yozish
        await SalaryRegisterModel.create(
          {
            worker_id: worker_id,
            tikish_soni: miqdor, // Tikish miqdori
            averlo_soni: 0, // Averlo miqdori
            upakovka_soni: 0, // Upakovka miqdori
            dazmol_soni: 0, // Dazmol miqdori
            datetime: Math.floor(Date.now() / 1000), // Unix timestamp
          },
          { transaction }
        );

        // Agar worker `is_fixed` false bo‘lsa, workerga balansni qo‘shish
        if (!worker.is_fixed) {
          // MarkedCostModel'dan tikish_costni olish
          const markedCost = await MarkedCostModel.findOne({
            where: { id: 1 }, // idni o'zgartirishingiz mumkin
          });

          if (!markedCost) {
            throw new HttpException(404, "MarkedCost topilmadi");
          }

          const tikishCost = new Decimal(markedCost.tikish_cost).mul(miqdor);

          // Workerga balansni qo‘shish
          worker.total_balance = new Decimal(worker.total_balance || 0)
            .plus(tikishCost)
            .toNumber();
          await worker.save({ transaction });
        }
      }

      // Tikishni yangilash
      Object.assign(tikish, { shablon_id, miqdor, worker_id, user_id });
      await tikish.save({ transaction });

      await transaction.commit();
      res.send(tikish);
    } catch (err) {
      await transaction.rollback();
      next(err);
    }
  };

  delete = async (req, res, next) => {
    const tikish = await TikishModel.findByPk(req.params.id);
    if (!tikish) throw new HttpException(404, "Tikish topilmadi");

    const shablon = await FoodShablonModel.findByPk(tikish.shablon_id, {
      include: [{ model: NeededProductModel, as: "ingredients" }],
    });
    if (!shablon) throw new HttpException(404, "Shablon topilmadi");

    const transaction = await TikishModel.sequelize.transaction();

    try {
      for (const ing of shablon.ingredients) {
        const totalMiqdor = new Decimal(ing.miqdor).mul(tikish.miqdor);
        const product = await ProductModel.findByPk(ing.product_id);
        if (!product) throw new HttpException(404, "Mahsulot topilmadi");

        product.sklad2_qoldiq = new Decimal(product.sklad2_qoldiq || 0)
          .plus(totalMiqdor)
          .toNumber();
        await product.save({ transaction });
      }

      shablon.bishish_qoldiq = new Decimal(shablon.bishish_qoldiq || 0)
        .minus(miqdor) // yoki .minus(tikish.miqdor) delete'da
        .toNumber();
      await shablon.save({ transaction });

      const worker = await WorkerModel.findByPk(tikish.worker_id);
      if (worker) {
        worker.stanokdan_soni = new Decimal(worker.stanokdan_soni || 0)
          .minus(tikish.miqdor)
          .toNumber();
        await worker.save({ transaction });
      }

      await tikish.destroy({ transaction });
      await transaction.commit();

      res.send({ message: "Tikish o‘chirildi" });
    } catch (err) {
      await transaction.rollback();
      next(err);
    }
  };

  getAll = async (req, res) => {
    const data = await TikishModel.findAll({
      include: [
        { model: WorkerModel, as: "tikish_worker" }, // Match association
        {
          model: FoodShablonModel,
          as: "tikish_shablon",
          include: [{ model: NeededProductModel, as: "ingredients" }],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.send(data);
  };

  getById = async (req, res) => {
    const data = await TikishModel.findByPk(req.params.id, {
      include: [
        { model: WorkerModel, as: "worker" },
        {
          model: FoodShablonModel,
          as: "tikish_shablon",
          include: [{ model: NeededProductModel, as: "ingredients" }],
        },
      ],
    });
    if (!data) throw new HttpException(404, "Topilmadi");
    res.send(data);
  };
}

module.exports = new TikishController();
