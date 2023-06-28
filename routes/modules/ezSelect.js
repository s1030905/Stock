const express = require("express");
const router = express.Router();
const { stockController } = require("../../controllers/stock-controller");

router.get("/0050", stockController.fifty);
router.get("/0056", stockController.fiftySix);
router.get("/foreignBuy", stockController.foreignBuy);
router.get("/localBuy", stockController.localBuy);

module.exports = router;
