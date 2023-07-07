const express = require("express");
const router = express.Router();
const { userController } = require("../controllers/user-controller");
const { authenticator } = require("../middleware/auth");
const stock = require("./modules/stock");
const passport = require("../config/passport");
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

router.get("/myChart", (req, res, next) => {
  try {
    const response = require("../data.json");
    const data = response.data;
    const date = [];
    const openEnd = [];
    const high = [];
    const low = [];
    const color = [];
    data.forEach((e) => {
      const formattedDate = e[0].replace("/", "").replace("/", "");
      const formattedOpenEnd = [Number(e[3]), Number(e[6])];
      date.push(formattedDate);
      openEnd.push(formattedOpenEnd);
      high.push(Number(e[4]));
      low.push(Number(e[5]));
      Number(e[7]) > 0 ? color.push("red") : color.push("green");
    });
    const max = Math.max(...high);
    const min = Math.min(...low);
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
