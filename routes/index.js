const express = require("express");
const router = express.Router();
const { stockController } = require("../controllers/stock-controller");

router.get("/ezSelect/0050", stockController.fifty);
router.get("/ezSelect/0056", stockController.fiftySix);

router.get("/ezSelect/index", (req, res) => {
  res.render("index");
});

module.exports = router;
