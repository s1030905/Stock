const router = require("express").Router();
const { getStock, stockList } = require("../../helpers/stock");
const { formattedDate } = require("../../helpers/date");
const { authenticator } = require("../../middleware/auth");
const { apiErrorHandler } = require("../../middleware/error-handler");
const { getStockNews } = require("../../helpers/news");

router.get("/stock/userStock", authenticator, async (req, res, next) => {
  try {
    // 取得0050資料
    const { response, timestamp, price } = await getStock("0050");
    const compare = [];

    // 日期轉換
    const date = [];
    timestamp.forEach((e) => {
      date.push(formattedDate(e));
    });

    // 使用者的自選股
    const user = req.user;
    const userStock = user.Stocks;
    const dic = await stockList();
    const stockId = ["0050"];
    const stockName = ["台灣50"];
    // 0050 ratio
    const sum0050 = price[0].close.reduce((acc, curr) => {
      return acc + curr;
    }, 0);
    const avg0050 = sum0050 / price[0].close.length;
    const ratio0050 = price[0].close.map((e) => (e / avg0050).toFixed(2));
    compare.push(ratio0050);

    // 使用者的自選股 ratio 計算
    for (const element of userStock) {
      const { timestamp, price } = await getStock(element.stockId);
      stockId.push(element.stockId);
      stockName.push(dic[element.stockId].name);
      const sum = price[0].close.reduce((acc, curr) => {
        return acc + curr;
      }, 0);
      const avg = sum / price[0].close.length;
      const ratio = price[0].close.map((e) => (e / avg).toFixed(2));
      compare.push(ratio);
    }
    return res.json({ compare, date, stockId, stockName });
  } catch (error) {
    next(error);
  }
});

router.get("/stock/:id/news", authenticator, async (req, res, next) => {
  try {
    const { id } = req.params;
    const dic = await stockList();
    const stockName = dic[id]["name"];
    const news = await getStockNews(stockName);
    return res.json(news);
  } catch (error) {
    next(error);
  }
});

router.get("/stock/:id", authenticator, async (req, res, next) => {
  try {
    // 取得特定id 資料
    const { id } = req.params;
    const { response, timestamp, price } = await getStock(id);

    // 取得繪圖必須資料 date, openEnd, highLow, color, max, min
    const date = [];
    const openEnd = [];
    const highLow = [];
    const high = price[0].high;
    const low = price[0].low;
    const color = [];
    const max = Math.max(...high);
    const min = Math.min(...low);

    // 時間轉換
    timestamp.forEach((e) => {
      date.push(formattedDate(e));
    });

    // 處理當 open/close 相同
    for (let i = 0; i < price[0].open.length; i++) {
      if (price[0].open[i] === price[0].close[i]) {
        price[0].close[i] -= 0.1;
      }
      let start = price[0].open[i].toFixed(2);
      let end = price[0].close[i].toFixed(2);
      openEnd.push([start, end]);

      // 決定顏色
      if (end > start) {
        color.push("red");
      } else if (end < start) {
        color.push("green");
      } else {
        color.push("black");
      }
    }
    for (let i = 0; i < high.length; i++) {
      highLow.push([high[i].toFixed(2), low[i].toFixed(2)]);
    }
    res.json({
      date,
      openEnd,
      highLow,
      max,
      min,
      color,
    });
  } catch (error) {
    next(error);
  }
});

router.use("/", apiErrorHandler);

module.exports = router;
