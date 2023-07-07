const express = require("express");
const router = express.Router();
const { userController } = require("../../controllers/user-controller");
const { authenticator } = require("../../middleware/auth");
const stock = require("./modules/stock");
const passport = require("../../config/passport");
const { getStock } = require("../../helpers/stock");
const { formattedDate } = require("../../helpers/date");
const axios = require("axios");

//簡易選股策略頁面
router.use("/stock", authenticator, stock);

//login
router.get("/login", (req, res) => {
  res.render("login");
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  userController.login
);

router.get("/logout", (req, res, next) => {
  try {
    req.logout((err) => {
      if (err) return err;
      return res.redirect("/login");
    });
  } catch (error) {
    next(error);
  }
});

//signup
router.get("/signup", (req, res) => {
  res.render("signup");
});

router.post("/signup", userController.signUP);

// home page
router.get("/", authenticator, async (req, res, next) => {
  try {
    const url = "https://openapi.twse.com.tw/v1/exchangeReport/MI_INDEX";
    let data = await axios.get(url);

    // 最後更新日期
    const headerDate = data.headers["last-modified"];
    // 將日期字串轉換為Date物件
    const dateObj = new Date(headerDate);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    const formattedDate = `${year - 1911}年${month}月${day}日`;
    const title = `${formattedDate} 大盤指數彙總表`;

    // 資料處理
    data = data.data;
    const dic = {};
    dic[data[0]["指數"]] = data[0];
    // stockChart(data);
    res.render("index", { data, title });
  } catch (error) {
    next(error);
  }
});

router.get("/myChart", async (req, res, next) => {
  try {
    const { response, timestamp, price } = await getStock(2330);
    const date = [];
    const openEnd = [];
    const high = price[0].high;
    const low = price[0].low;
    const color = [];
    const max = Math.max(...high);
    const min = Math.min(...low);
    timestamp.forEach((e) => {
      date.push(formattedDate(e));
    });
    for (let i = 0; i < price[0].open.length; i++) {
      let start = price[0].open[i];
      let end = price[0].close[i];
      openEnd.push([start, end]);
      if (end > start) {
        color.push("red");
      } else if (end < start) {
        color.push("green");
      } else {
        color.push("black");
      }
    }
    res.render("myChart", {
      date,
      openEnd: [openEnd],
      high,
      low,
      max,
      min,
      color,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
