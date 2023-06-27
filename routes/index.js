const express = require("express");
const router = express.Router();
const { getPrice } = require("../helpers/stock");

// router.get("/", async (req, res) => {
//   const data = await getPrice();
//   console.log(data);
//   res.send(data);
// });

router.get("/", (req, res) => {
  res.render("index");
});

module.exports = router;
