const express = require("express");
const router = express.Router();
const userController = require("../controllers/user-controller");
const { getStock } = require("../helpers/stock");
const ezSelect = require("./modules/ezSelect");

router.use("/stock/ezSelect", ezSelect);

router.get("/stock/login", (req, res) => {
  res.render("login");
});

router.get("/stock/signup", (req, res) => {
  res.render("signup");
});

router.get("/stock/index", (req, res) => {
  res.render("index");
});

router.post("/stock/search", async (req, res) => {
  let { stockId } = req.body;
  stockId = stockId.trim();

  // 輸入值得錯誤處理
  // 空白
  if (!stockId) {
    console.log("請輸入正確股票代號");
    return res.render("stock-list", { err: "請輸入正確股票代號" });
  }

  const data = await getStock(stockId);

  // 錯誤處理
  if (data.stat !== "OK") {
    console.log("似乎有錯誤");
    return res.json(data);
  }

  //資料處理
  const obj = {};
  const response = data.data;
  response.forEach((element) => {
    obj[element[0]] = {
      date: element[0],
      dealStock: element[1],
      dealMoney: element[2],
      start: element[3],
      hight: element[4],
      low: element[5],
      end: element[6],
      difference: element[7],
      dealNumber: element[8],
    };
  });

  return res.render("getStock", { data: obj });
  // res.render("index", data);
});

module.exports = router;
