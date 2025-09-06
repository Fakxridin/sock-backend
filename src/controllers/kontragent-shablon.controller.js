// controllers/KontragentShablonController.js
const {
  KontragentShablonModel,
  KontragentShablonProductModel,
  KontragentModel,
  FoodShablonModel,
  UserModel,
} = require("../models");

const HttpException = require("../utils/HttpException.utils");
const BaseController = require("./BaseController");
const sequelize = require("../db/db-sequelize");

// ---- helpers ----
function typeSign(type) {
  // give -> subtract (−1); take -> add (+1)
  return type === "take" ? +1 : -1;
}

function sumByShablon(lines = []) {
  const m = new Map(); // shablon_id -> total_miqdor
  for (const l of lines) {
    const id = Number(l.shablon_id);
    const q = Number(l.miqdor || 0);
    m.set(id, (m.get(id) || 0) + q);
  }
  return m;
}

class KontragentShablonController extends BaseController {
  // GET /kontragent-shablon/:id
  getById = async (req, res, next) => {
    const row = await KontragentShablonModel.findByPk(req.params.id, {
      include: [
        { model: KontragentModel, as: "kontragent" },
        { model: UserModel, as: "user" },
        {
          model: KontragentShablonProductModel,
          as: "products",
          include: [{ model: FoodShablonModel, as: "shablon" }],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    if (!row) throw new HttpException(404, "Topilmadi");
    res.send(row);
  };

  // GET /kontragent-shablon/take
  getAllTake = async (_req, res, _next) => {
    const list = await KontragentShablonModel.findAll({
      where: { type: "take" },
      include: [
        { model: KontragentModel, as: "kontragent" },
        { model: UserModel, as: "user" },
        {
          model: KontragentShablonProductModel,
          as: "products",
          include: [{ model: FoodShablonModel, as: "shablon" }],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.send(list);
  };

  // GET /kontragent-shablon/give
  getAllGive = async (_req, res, _next) => {
    const list = await KontragentShablonModel.findAll({
      where: { type: "give" },
      include: [
        { model: KontragentModel, as: "kontragent" },
        { model: UserModel, as: "user" },
        {
          model: KontragentShablonProductModel,
          as: "products",
          include: [{ model: FoodShablonModel, as: "shablon" }],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.send(list);
  };

  // POST /kontragent-shablon
  create = async (req, res, next) => {
    this.checkValidation(req);
    const { user_name, kontragent_id, user_id, type, total_summa, products } =
      req.body;

    await sequelize.transaction(async (t) => {
      // 1) create header
      const header = await KontragentShablonModel.create(
        { user_name, kontragent_id, user_id, type, total_summa },
        { transaction: t }
      );

      // 2) create lines
      const items = (products || []).map((p) => ({
        kontragent_shablon_id: header.id,
        shablon_id: p.shablon_id,
        miqdor: p.miqdor,
        narx: p.narx,
        summa: p.summa,
      }));
      if (items.length) {
        await KontragentShablonProductModel.bulkCreate(items, {
          transaction: t,
        });
      }

      // 3) apply effects
      // 3a) balance (give: -, take: +)
      const k = await KontragentModel.findByPk(kontragent_id, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      if (!k) throw new HttpException(404, "Kontragent topilmadi");
      k.balance =
        Number(k.balance || 0) + typeSign(type) * Number(total_summa || 0);
      await k.save({ transaction: t });

      // 3b) sklad1_qoldiq per shablon (give: -, take: +)
      const sums = sumByShablon(items);
      for (const [shablonId, qty] of sums) {
        const sh = await FoodShablonModel.findByPk(shablonId, {
          transaction: t,
          lock: t.LOCK.UPDATE,
        });
        if (sh) {
          sh.sklad2_qoldiq =
            Number(sh.sklad2_qoldiq || 0) + typeSign(type) * Number(qty || 0);
          await sh.save({ transaction: t });
        }
      }

      res.send({ success: true, id: header.id });
    });
  };

  // PUT /kontragent-shablon/:id
  update = async (req, res, next) => {
    const { id } = req.params;
    const { user_name, kontragent_id, user_id, type, total_summa, products } =
      req.body;

    await sequelize.transaction(async (t) => {
      const header = await KontragentShablonModel.findByPk(id, {
        include: [{ model: KontragentShablonProductModel, as: "products" }],
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      if (!header) throw new HttpException(404, "Topilmadi");

      // snapshot
      const oldType = header.type;
      const oldTotal = Number(header.total_summa || 0);
      const newType = type ?? oldType;
      const newTotal = Number(total_summa ?? (header.total_summa || 0));

      // ---- balance delta ----
      // effect(x) = sign(x) * total
      const kId = kontragent_id ?? header.kontragent_id;
      const k = await KontragentModel.findByPk(kId, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      if (!k) throw new HttpException(404, "Kontragent topilmadi");
      const balanceDelta =
        typeSign(newType) * newTotal - typeSign(oldType) * oldTotal;
      if (balanceDelta !== 0) {
        k.balance = Number(k.balance || 0) + balanceDelta;
        await k.save({ transaction: t });
      }

      // ---- sklad1_qoldiq delta per shablon ----
      const oldSum = sumByShablon(
        (header.products || []).map((p) => ({
          shablon_id: p.shablon_id,
          miqdor: p.miqdor,
        }))
      );

      const newLines = (products || []).map((p) => ({
        shablon_id: Number(p.shablon_id),
        miqdor: Number(p.miqdor || 0),
        narx: p.narx,
        summa: p.summa,
      }));
      const newSum = sumByShablon(newLines);

      const shIds = new Set([...oldSum.keys(), ...newSum.keys()]);
      for (const shId of shIds) {
        const oldQty = Number(oldSum.get(shId) || 0);
        const newQty = Number(newSum.get(shId) || 0);
        // effect delta = s(newType)*newQty - s(oldType)*oldQty
        const qtyDelta =
          typeSign(newType) * newQty - typeSign(oldType) * oldQty;
        if (qtyDelta !== 0) {
          const sh = await FoodShablonModel.findByPk(shId, {
            transaction: t,
            lock: t.LOCK.UPDATE,
          });
          if (sh) {
            sh.sklad2_qoldiq = Number(sh.sklad2_qoldiq || 0) + qtyDelta;
            await sh.save({ transaction: t });
          }
        }
      }

      // ---- rewrite lines ----
      await KontragentShablonProductModel.destroy({
        where: { kontragent_shablon_id: id },
        transaction: t,
      });
      if (newLines.length) {
        await KontragentShablonProductModel.bulkCreate(
          newLines.map((p) => ({ kontragent_shablon_id: id, ...p })),
          { transaction: t }
        );
      }

      // ---- save header ----
      header.user_name = user_name ?? header.user_name;
      header.kontragent_id = kId;
      header.user_id = user_id ?? header.user_id;
      header.type = newType;
      header.total_summa = newTotal;
      await header.save({ transaction: t });

      res.send({ success: true, message: "Yangilandi" });
    });
  };

  // DELETE /kontragent-shablon/:id
  delete = async (req, res, next) => {
    const { id } = req.params;

    await sequelize.transaction(async (t) => {
      const header = await KontragentShablonModel.findByPk(id, {
        include: [{ model: KontragentShablonProductModel, as: "products" }],
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      if (!header) throw new HttpException(404, "Topilmadi");

      // reverse balance
      const k = await KontragentModel.findByPk(header.kontragent_id, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      if (!k) throw new HttpException(404, "Kontragent topilmadi");
      const priorBalanceEff =
        typeSign(header.type) * Number(header.total_summa || 0);
      k.balance = Number(k.balance || 0) - priorBalanceEff;
      await k.save({ transaction: t });

      // reverse sklad2 effects per shablon
      const priorSum = sumByShablon(
        (header.products || []).map((p) => ({
          shablon_id: p.shablon_id,
          miqdor: p.miqdor,
        }))
      );
      for (const [shId, qty] of priorSum) {
        const sh = await FoodShablonModel.findByPk(shId, {
          transaction: t,
          lock: t.LOCK.UPDATE,
        });
        if (sh) {
          const priorQtyEff = typeSign(header.type) * Number(qty || 0);
          sh.sklad2_qoldiq = Number(sh.sklad2_qoldiq || 0) - priorQtyEff;
          await sh.save({ transaction: t });
        }
      }

      await KontragentShablonProductModel.destroy({
        where: { kontragent_shablon_id: id },
        transaction: t,
      });
      await header.destroy({ transaction: t });

      res.send({ success: true, message: "O‘chirildi" });
    });
  };
}

module.exports = new KontragentShablonController();
