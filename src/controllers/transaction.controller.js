const {
  TransactionModel,
  TransactionProductModel,
  ProductModel,
  FoodShablonModel,
  UserModel,
  UnitModel,
} = require("../models");

const HttpException = require("../utils/HttpException.utils");
const BaseController = require("./BaseController");
const { Op } = require("sequelize");
function attachUnitName(transactions) {
  return transactions.map((t) => {
    const products = (t.products || []).map((p) => ({
      ...p.toJSON(),
      unit_name: p.product && p.product.unit ? p.product.unit.name : null,
    }));
    return { ...t.toJSON(), products };
  });
}
class TransactionController extends BaseController {
  // 🔹 GET ALL
  getAll = async (req, res, next) => {
    const list = await TransactionModel.findAll({
      include: [
        { model: UserModel, as: "skladchi" },
        { model: UserModel, as: "oluvchi" },
        {
          model: TransactionProductModel,
          as: "products",
          include: [
            {
              model: ProductModel,
              as: "product",
              attributes: ["id"], // kifoya
              include: [{ model: UnitModel, as: "unit", attributes: ["name"] }],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // MUHIM: to'g'ridan-to'g'ri listni jo'natmang — mapping qiling
    res.send(attachUnitName(list));
  };

  // 🔹 GET BY ID
  getById = async (req, res, next) => {
    const transaction = await TransactionModel.findByPk(req.params.id, {
      include: [
        {
          model: TransactionProductModel,
          as: "products",
          include: [
            {
              model: ProductModel,
              as: "product",
              attributes: ["id"],
              include: [{ model: UnitModel, as: "unit", attributes: ["name"] }],
            },
          ],
        },
        { model: UserModel, as: "skladchi" },
        { model: UserModel, as: "oluvchi" },
      ],
    });

    if (!transaction) throw new HttpException(404, "Topilmadi");
    res.send(attachUnitName([transaction])[0]);
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
    for (let p of transaction.products) {
      // Change `const` to `let`
      let miqdor = Number(p.miqdor); // Change `const` to `let` to allow reassignment

      // ✅ PRODUCT
      if (p.product_id) {
        const product = await ProductModel.findByPk(p.product_id);
        if (product) {
          // Check if there is enough stock in the source warehouse
          if (
            transaction.qayerdan === "Sklad1" &&
            product.sklad1_qoldiq < miqdor
          ) {
            // If not enough stock, use the available amount
            miqdor = product.sklad1_qoldiq;
          } else if (
            transaction.qayerdan === "Sklad2" &&
            product.sklad2_qoldiq < miqdor
          ) {
            // If not enough stock, use the available amount
            miqdor = product.sklad2_qoldiq;
          }

          // Perform the transfer
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
          // Check if there is enough stock in the source warehouse
          if (
            transaction.qayerdan === "Sklad1" &&
            shablon.sklad1_qoldiq < miqdor
          ) {
            // If not enough stock, use the available amount
            miqdor = shablon.sklad1_qoldiq;
          } else if (
            transaction.qayerdan === "Sklad2" &&
            shablon.sklad2_qoldiq < miqdor
          ) {
            // If not enough stock, use the available amount
            miqdor = shablon.sklad2_qoldiq;
          }

          // Perform the transfer
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
        {
          model: TransactionProductModel,
          as: "products",
          include: [
            {
              model: ProductModel,
              as: "product",
              attributes: ["id"],
              include: [{ model: UnitModel, as: "unit", attributes: ["name"] }],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.send(attachUnitName(list));
  };

  getFromSklad2 = async (req, res, next) => {
    const list = await TransactionModel.findAll({
      where: { qayerdan: "Sklad2" },
      include: [
        { model: UserModel, as: "skladchi" },
        { model: UserModel, as: "oluvchi" },
        {
          model: TransactionProductModel,
          as: "products",
          include: [
            {
              model: ProductModel,
              as: "product",
              attributes: ["id"],
              include: [{ model: UnitModel, as: "unit", attributes: ["name"] }],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.send(attachUnitName(list));
  };
}

module.exports = new TransactionController();
