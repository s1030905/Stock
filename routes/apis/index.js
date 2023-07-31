const router = require("express").Router();
const axios = require("axios");
const { getStock, stockList } = require("../../helpers/stock");
const { formattedDate } = require("../../helpers/date");
const { authenticator } = require("../../middleware/auth");
const { apiErrorHandler } = require("../../middleware/error-handler");
const { getStockNews } = require("../../helpers/news");

router.get("/stock/index", authenticator, async (req, res, next) => {
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
    res.json({ data, title });
  } catch (error) {
    next(error);
  }
});

router.get("/stock/userStock", authenticator, async (req, res, next) => {
  try {
    // 取得0050資料
    const { timestamp, price } = await getStock("0050");
    const [compare, kLine] = [[], []];

    // 日期轉換
    const date = [];
    for (let i = 1; i < timestamp.length; i++) {
      date.push(formattedDate(timestamp[i]));
    }

    // 使用者的自選股
    const user = req.user;
    const userStock = user.Stocks;
    const dic = await stockList();
    const stockId = ["0050"];
    const stockName = ["台灣50"];

    // 0050 ratio
    let last = price[0].close.slice(-1)[0] ? 0 : 1;
    if (last) price[0].close.pop();

    // 第1, 2張圖 所需資料陣列
    const [ratio0050, kLine0050] = [[], []];
    for (let i = 0; i < price[0].close.length; i++) {
      if (i === 0) {
        ratio0050.push(0);
        kLine0050.push(0);
      } else {
        // 第1張圖 container-day
        ratio0050.push(
          (
            ((price[0].close[i] - price[0].close[i - 1]) /
              price[0].close[i - 1]) *
            100
          ).toFixed(2)
        );
        // 第2張圖 container-mon
        kLine0050.push(
          (
            ((price[0].close[i] - price[0].close[0]) / price[0].close[0]) *
            100
          ).toFixed(2)
        );
      }
    }
    compare.push(ratio0050);
    kLine.push(kLine0050);

    // 使用者的自選股 ratio 計算
    for (const element of userStock) {
      const { price } = await getStock(element.stockId);
      stockId.push(element.stockId);
      stockName.push(dic[element.stockId].name);
      // 若ETF有bug 將今日資料刪除
      if (last) price[0].close.pop();
      const [ratio, ratio2] = [[], []];
      for (let i = 0; i < price[0].close.length; i++) {
        if (i === 0) {
          ratio.push(0);
          ratio2.push(0);
        } else {
          // 第1張圖 container-day
          ratio.push(
            (
              ((price[0].close[i] - price[0].close[i - 1]) /
                price[0].close[i - 1]) *
              100
            ).toFixed(2)
          );
          // 第2張圖 container-mon
          ratio2.push(
            (
              ((price[0].close[i] - price[0].close[0]) / price[0].close[0]) *
              100
            ).toFixed(2)
          );
        }
      }
      compare.push(ratio);
      kLine.push(ratio2);
    }
    return res.json({ compare, date, stockId, stockName, kLine });
  } catch (error) {
    next(error);
  }
});

router.get("/stock/:id/news", authenticator, async (req, res, next) => {
  try {
    const { id } = req.params;
    // 取得中文名稱
    const dic = await stockList();
    const stockName = dic[id]["name"];
    // 取得相關新聞
    const news = await getStockNews(stockName);
    return res.json(news);
  } catch (error) {
    next(error);
  }
});

router.get("/stock/:id/kd", authenticator, async (req, res, next) => {
  try {
    // 取得特定id 資料
    const { id } = req.params;
    const { timestamp, price } = await getStock(id);

    // 取得繪圖、計算KD必須資料 date, ,high, low, close
    const date = [];
    const high = price[0].high;
    const low = price[0].low;
    const close = price[0].close;
    const diff = [0, 0, 0, 0];
    const note = ["--", "--", "--", "--"];

    // API bug ETF查詢錯誤
    const last = close.slice(-1)[0] ? 0 : 1;

    // 時間轉換
    timestamp.forEach((e) => {
      date.push(formattedDate(e));
    });
    if (last) date.pop();

    // 畫 KD 的 K
    // RSV值計算公式：(收盤價 – 設定周期內最低價) / (設定周期內最高價 – 設定周期內最低價) × 100
    // K值計算公式：(2/3 × 前一根K線K值)＋(1/3 × 當日RSV)
    // D值計算公式：D值= (2/3 × 前一根K線D值)＋(1/3 × 當日K值)
    const [rsv, k, d] = [
      [0, 0, 0, 0],
      [50, 50, 50, 50],
      [50, 50, 50, 50],
    ];
    for (let i = 4; i < price[0].close.length - last; i++) {
      const cyclePriceHigh = high.slice(i - 4, i + 1);
      const cyclePriceLow = low.slice(i - 4, i + 1);
      let cycleMin = Math.min(...cyclePriceLow);
      let cycleMax = Math.max(...cyclePriceHigh);
      rsv.push(
        (
          ((price[0].close[i] - cycleMin) / (cycleMax - cycleMin)) *
          100
        ).toFixed(2)
      );
      k.push(((2 / 3) * k[i - 1] + (1 / 3) * rsv[i]).toFixed(2));
      d.push(((2 / 3) * d[i - 1] + (1 / 3) * k[i]).toFixed(2));
    }
    // 每日KD分析結果
    for (let i = 4; i < k.length; i++) {
      diff.push((k[i] - d[i]).toFixed(2));
      let dateNote = "";
      if (k[i] > d[i] && k[i - 1] < d[i - 1]) {
        dateNote += "黃金交叉";
      }
      if (k[i] < d[i] && k[i - 1] > d[i - 1]) {
        dateNote += "死亡交叉";
      }
      if (k[i] >= 80 && d[i] >= 80) {
        if (dateNote.length >= 4) {
          dateNote += "、超買";
        } else {
          dateNote += "超買";
        }
      }
      if (k[i] <= 20 && d[i] <= 20 && dateNote.length >= 4) {
        if (dateNote.length >= 4) {
          dateNote += "、超賣";
        } else {
          dateNote += "超賣";
        }
      }
      if (!dateNote.length) {
        dateNote += "--";
      }
      note.push(dateNote);
    }
    res.json({ date, k, d, diff, note, close });
  } catch (error) {
    next(error);
  }
});

router.get("/stock/:id/rsi", authenticator, async (req, res, next) => {
  try {
    // 取得特定id 資料
    const { id } = req.params;
    const { timestamp, price } = await getStock(id);

    // 取得繪圖、計算KD必須資料 date, ,high, low, close
    const date = [];
    const close = price[0].close;

    // API bug ETF查詢錯誤
    const last = close.slice(-1)[0] ? 0 : 1;

    // 時間轉換
    timestamp.forEach((e) => {
      date.push(formattedDate(e));
    });
    if (last) {
      date.pop();
      close.pop();
    }

    // 畫 RSI (5, 10)
    // RSI (相對強弱指標) = n日漲幅平均值÷(n日漲幅平均值+ n日跌幅平均值) × 100
    // n日漲幅平均值 = n日內上漲日總上漲幅度加總 ÷ n
    // n日跌幅平均值 = n日內下跌日總下跌幅度加總 ÷ n
    const RSI5 = [null, null, null, null, null],
      RSI10 = [null, null, null, null, null, null, null, null, null, null];
    let up5 = 0,
      down5 = 0,
      up10 = 0,
      down10 = 0;
    // RSI5 計算
    for (let i = 1; i < close.length; i++) {
      let diff = (close[i] - close[i - 1]) / 5;
      if (i < 6) {
        if (diff >= 0) {
          up5 += diff;
        } else {
          down5 += diff;
        }
      }
      if (i === 6) {
        RSI5.push(Number(((up5 / (up5 - down5)) * 100).toFixed(2)));
      }
      if (i > 6) {
        if (diff >= 0) {
          up5 += (diff - up5) / 5;
          down5 += (0 - down5) / 5;
        } else {
          up5 += (0 - up5) / 5;
          down5 += (diff - down5) / 5;
        }
        RSI5.push(Number(((up5 / (up5 - down5)) * 100).toFixed(2)));
      }
    }

    // RSI10 計算
    for (let i = 1; i < close.length; i++) {
      let diff = (close[i] - close[i - 1]) / 10;
      if (i < 11) {
        if (diff >= 0) {
          up10 += diff;
        } else {
          down10 += diff;
        }
      }
      if (i === 11) {
        RSI10.push(Number(((up10 / (up10 - down10)) * 100).toFixed(2)));
      }
      if (i > 11) {
        if (diff >= 0) {
          up10 += (diff - up10) / 10;
          down10 += (0 - down10) / 10;
        } else {
          up10 += (0 - up10) / 10;
          down10 += (diff - down10) / 10;
        }
        RSI10.push(Number(((up10 / (up10 - down10)) * 100).toFixed(2)));
      }
    }
    const note = ["--", "--", "--", "--", "--", "--", "--", "--", "--", "--"];
    // 每日RSI分析結果
    for (let i = 0; i < RSI10.length; i++) {
      // let diff = (RSI5[i] - RSI10[i]) / 10;
      let dateNote = "";
      if (RSI5[i] > RSI10[i] && RSI5[i - 1] < RSI10[i - 1]) {
        dateNote += "黃金交叉";
      }
      if (RSI5[i] < RSI10[i] && RSI5[i - 1] > RSI10[i - 1]) {
        dateNote += "死亡交叉";
      }
      if (RSI5[i] >= 80) {
        if (dateNote.length >= 4) {
          dateNote += "、超買";
        } else {
          dateNote += "超買";
        }
      }
      if (RSI5[i] <= 20) {
        if (dateNote.length >= 4) {
          dateNote += "、超賣";
        } else {
          dateNote += "超賣";
        }
      }
      if (!dateNote.length) {
        dateNote += "--";
      }
      note.push(dateNote);
    }

    return res.json({ close, date, RSI5, RSI10, note });
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
    const volume = price[0].volume;
    const color = [];

    // API bug ETF查詢錯誤
    const last = high.slice(-1)[0] ? 0 : 1;
    let [max, min] = [
      Math.max(...high.slice(0, high.length - last)),
      Math.min(...low.slice(0, low.length - last)),
    ];
    [max, min] = [
      Math.ceil(max + (max - min) * 0.1),
      Math.floor(min - (max - min) * 0.1),
    ];
    // 時間轉換
    timestamp.forEach((e) => {
      date.push(formattedDate(e));
    });
    if (last) date.pop();

    // 處理當 open/close 相同, 決定K棒顏色, 成交量平均值
    let volAvg = 0;
    const volumeRelative = [];
    for (let i = 0; i < price[0].open.length - last; i++) {
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

      // 計算成交量平均值
      volAvg += volume[i] / (volume.length - last);
    }
    // highLow 資料整理 與 相對成交量
    for (let i = 0; i < high.length - last; i++) {
      highLow.push([high[i].toFixed(2), low[i].toFixed(2)]);
      volumeRelative.push(((volume[i] / volAvg) * 25).toFixed(2));
    }
    res.json({
      date,
      openEnd,
      highLow,
      max,
      min,
      color,
      volumeRelative,
    });
  } catch (error) {
    next(error);
  }
});

router.use("/", apiErrorHandler);

module.exports = router;
