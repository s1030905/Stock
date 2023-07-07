const express = require("express");
const router = express.Router();
const passport = require("../../config/passport");
const { stockController } = require("../../controllers/stock-controller");

router.get("/0050", stockController.fifty);
router.get("/0056", stockController.fiftySix);
router.get("/foreignBuy", stockController.foreignBuy);
router.get("/localBuy", stockController.localBuy);
router.get("/userStock", stockController.userStock);
router.post("/search", stockController.search);
router.post("/:id", stockController.addStock);
router.delete("/:id", stockController.deleteStock);

module.exports = router;
