// routes/foodShablon.routes.js
const express = require("express");
const router = express.Router();

const CalculationController = require("../controllers/calculation.controller");
const auth = require("../middleware/auth.middleware");
const awaitHandlerFactory = require("../middleware/awaitHandlerFactory.middleware");
const joiMiddleware = require("../middleware/joi.middleware");

// ⬇️ Multer middleware (fayl qabul qilish) — 'img_name' maydoni
// Fayl yo'li sizning strukturangizga mos bo'lsin (middleware papkangiz bir xil)
const upload = require("../middleware/upload.middleware"); // upload.single('img_name')

// Agar validator kerak bo'lsa keyin yoqasiz
const {
  CaclulationSchema,
} = require("../middleware/validators/calculation.validator");

// ----------------------------- GET-lar -----------------------------
router.get("/", auth(), awaitHandlerFactory(CalculationController.getAll));

router.get(
  "/shablon-ingredients/:shablon_id",
  auth(),
  awaitHandlerFactory(CalculationController.getIngredientsByShablonId)
);

router.get(
  "/id/:id",
  auth(),
  awaitHandlerFactory(CalculationController.getById)
);

// ----------------------------- CREATE -----------------------------
// MUHIM: upload.single('img_name') VALIDATIONDAN OLDIN bo'lsin, aks holda req.body bo'sh qoladi
router.post(
  "/",
  auth(),
  upload.single("img_name"),
  joiMiddleware(CaclulationSchema.create), // <-- kerak bo'lsa yoqing; multipart bilan ishlaydi
  awaitHandlerFactory(CalculationController.create)
);

// ----------------------------- UPDATE -----------------------------
// PATCH ham fayl qabul qiladi (yangi rasm kelsa eskisini o'chirish uchun)
router.patch(
  "/id/:id",
  auth(),
  upload.single("img_name"),
  joiMiddleware(CaclulationSchema.update),
  awaitHandlerFactory(CalculationController.update)
);

// ----------------------------- DELETE -----------------------------
router.delete(
  "/id/:id",
  auth(),
  awaitHandlerFactory(CalculationController.delete)
);

module.exports = router;
