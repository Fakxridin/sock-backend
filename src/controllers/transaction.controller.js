const {
  TransactionModel,
  TransactionProductModel,
  ProductModel,
  FoodShablonModel,
  UserModel,
} = require("../models");

const HttpException = require("../utils/HttpException.utils");
const BaseController = require("./BaseController");
const { Op } = require("sequelize");

class TransactionController extends BaseController {
  // 🔹 GET ALL
  getAll = async (req, res, next) => {
    const list = await TransactionModel.findAll({
      include: [
        { model: UserModel, as: "skladchi" },
        { model: UserModel, as: "oluvchi" },
        { model: TransactionProductModel, as: "products" },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.send(list);
  };

  // 🔹 GET BY ID
  getById = async (req, res, next) => {
    const transaction = await TransactionModel.findByPk(req.params.id, {
      include: [
        { model: TransactionProductModel, as: "products" },
        { model: UserModel, as: "skladchi" },
        { model: UserModel, as: "oluvchi" },
      ],
    });
    if (!transaction) throw new HttpException(404, "Topilmadi");
    res.send(transaction);
  };

  // 🔹 CREATE
  create = async (req, res, next) => {
    this.checkValidation(req);
    const {
      is_accepted,
      skladchi_id,
      oluvchi_id,
      qayerdan,
      qayerga,
      products,
    } = req.body;

    const transaction = await TransactionModel.create({
      is_accepted,
      skladchi_id,
      oluvchi_id,
      qayerdan,
      qayerga,
    });

    const items = products.map((p) => ({
      transaction_id: transaction.id,
      product_id: p.product_id > 0 ? p.product_id : null, // <-- MUHIM O‘ZGARISH
      food_shablon_id: p.food_shablon_id || null,
      miqdor: p.miqdor,
    }));
    await TransactionProductModel.bulkCreate(items);
    res.send({ success: true, transaction_id: transaction.id });
  };

  // 🔹 UPDATE
  update = async (req, res, next) => {
    const { id } = req.params;
    const { skladchi_id, oluvchi_id, qayerdan, qayerga, products } = req.body;

    const transaction = await TransactionModel.findByPk(id);
    if (!transaction) throw new HttpException(404, "Transaction topilmadi");
    if (transaction.is_accepted === "tasdiq")
      throw new HttpException(400, "Tasdiqlangan transaction yangilanmaydi");

    transaction.skladchi_id = skladchi_id;
    transaction.oluvchi_id = oluvchi_id;
    transaction.qayerdan = qayerdan;
    transaction.qayerga = qayerga;

    await transaction.save();

    // eski mahsulotlarni o'chirib yangilarini yozish
    await TransactionProductModel.destroy({ where: { transaction_id: id } });

    const items = products.map((p) => ({
      transaction_id: transaction.id,
      product_id: p.product_id > 0 ? p.product_id : null, // <-- MUHIM O‘ZGARISH
      food_shablon_id: p.food_shablon_id || null,
      miqdor: p.miqdor,
    }));
    await TransactionProductModel.bulkCreate(items);

    res.send({ success: true, message: "Transaction yangilandi" });
  };

  // 🔹 DELETE
  delete = async (req, res, next) => {
    const transaction = await TransactionModel.findByPk(req.params.id);
    if (!transaction) throw new HttpException(404, "Transaction topilmadi");
    if (transaction.is_accepted === "tasdiq")
      throw new HttpException(
        400,
        "Tasdiqlangan transaction o‘chirib bo‘lmaydi"
      );

    await TransactionProductModel.destroy({
      where: { transaction_id: transaction.id },
    });
    await transaction.destroy();

    res.send({ success: true, message: "Transaction o‘chirildi" });
  };

  approve = async (req, res, next) => {
    const { transaction_id, user_id } = req.body;

    const transaction = await TransactionModel.findByPk(transaction_id, {
      include: [{ model: TransactionProductModel, as: "products" }],
    });

    if (!transaction) throw new HttpException(404, "Topilmadi");

    const isAllowed =
      transaction.skladchi_id === user_id || transaction.oluvchi_id === user_id;

    if (!isAllowed)
      throw new HttpException(403, "Siz bu transactionni tasdiqlay olmaysiz");

    if (transaction.is_accepted === "tasdiq")
      return res.send({ message: "Allaqachon tasdiqlangan" });

    if (transaction.is_accepted === "rad")
      return res.send({ message: "Bu transaction rad etilgan" });

    // Mahsulotlar o‘tkaziladi
    for (const p of transaction.products) {
      const miqdor = Number(p.miqdor);

      // ✅ PRODUCT
      if (p.product_id) {
        const product = await ProductModel.findByPk(p.product_id);
        if (product) {
          if (
            transaction.qayerdan === "Sklad1" &&
            transaction.qayerga === "Sklad2"
          ) {
            product.sklad1_qoldiq -= miqdor;
            product.sklad2_qoldiq += miqdor;
          } else if (
            transaction.qayerdan === "Sklad2" &&
            transaction.qayerga === "Sklad1"
          ) {
            product.sklad2_qoldiq -= miqdor;
            product.sklad1_qoldiq += miqdor;
          }
          await product.save();
        }
      }

      // ✅ FOOD SHABLON
      if (p.food_shablon_id) {
        const shablon = await FoodShablonModel.findByPk(p.food_shablon_id);
        if (shablon) {
          if (
            transaction.qayerdan === "Sklad1" &&
            transaction.qayerga === "Sklad2"
          ) {
            shablon.sklad1_qoldiq -= miqdor;
            shablon.sklad2_qoldiq += miqdor;
          } else if (
            transaction.qayerdan === "Sklad2" &&
            transaction.qayerga === "Sklad1"
          ) {
            shablon.sklad2_qoldiq -= miqdor;
            shablon.sklad1_qoldiq += miqdor;
          }
          await shablon.save();
        }
      }
    }

    transaction.is_accepted = "tasdiq";
    await transaction.save();
    res.send({ success: true, message: "Tasdiqlandi" });
  };

  // 🔹 REJECT
  reject = async (req, res, next) => {
    const { transaction_id, user_id } = req.body;

    const transaction = await TransactionModel.findByPk(transaction_id);
    if (!transaction) throw new HttpException(404, "Transaction topilmadi");

    // ✅ Faqat `skladchi_id` yoki `oluvchi_id` reject qila oladi
    const isAllowed =
      transaction.skladchi_id === user_id || transaction.oluvchi_id === user_id;

    if (!isAllowed)
      throw new HttpException(403, "Siz bu transactionni rad etolmaysiz");

    // Allaqachon tasdiqlangan yoki rad etilgan bo‘lsa xabar beriladi
    if (transaction.is_accepted === "tasdiq")
      return res.send({
        message: "Allaqachon tasdiqlangan, rad qilib bo‘lmaydi",
      });

    if (transaction.is_accepted === "rad")
      return res.send({ message: "Bu transaction allaqachon rad etilgan" });

    transaction.is_accepted = "rad";
    await transaction.save();

    res.send({ success: true, message: "Rad etildi" });
  };
  getFromSklad1 = async (req, res, next) => {
    const list = await TransactionModel.findAll({
      where: { qayerdan: "Sklad1" },
      include: [
        { model: UserModel, as: "skladchi" },
        { model: UserModel, as: "oluvchi" },
        { model: TransactionProductModel, as: "products" },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.send(list);
  };
  getFromSklad2 = async (req, res, next) => {
    const list = await TransactionModel.findAll({
      where: { qayerdan: "Sklad2" },
      include: [
        { model: UserModel, as: "skladchi" },
        { model: UserModel, as: "oluvchi" },
        { model: TransactionProductModel, as: "products" },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.send(list);
  };
}

module.exports = new TransactionController();
