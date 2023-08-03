const router = require("express").Router();
const axios = require("axios");
const { getStock, stockList, getStock180 } = require("../../helpers/stock");
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
    const { timestamp, price, tradeDay90 } = await getStock180(id);

    // 取得繪圖、計算KD必須資料 date, ,high, low, close
    const date = [];
    const high = price[0].high;
    const low = price[0].low;
    const close = price[0].close;
    const diff = new Array(8).fill(0);
    const note = new Array(8).fill("--");

    // API bug ETF查詢錯誤
    const last = close.slice(-1)[0] ? 0 : 1;

    // 時間轉換
    timestamp.forEach((e) => {
      date.push(formattedDate(e));
    });
    if (last) date.pop();
    const day90Index = date.indexOf(formattedDate(tradeDay90));

    // 畫 KD 的 (9, 14)
    // RSV值計算公式：(收盤價 – 設定周期內最低價) / (設定周期內最高價 – 設定周期內最低價) × 100
    // K值計算公式：(2/3 × 前一根K線K值)＋(1/3 × 當日RSV)
    // D值計算公式：D值= (2/3 × 前一根K線D值)＋(1/3 × 當日K值)
    const [rsv, k, d] = [
      new Array(8).fill(0),
      new Array(8).fill(50),
      new Array(8).fill(50),
    ];
    for (let i = 8; i < price[0].close.length - last; i++) {
      const cyclePriceHigh = high.slice(i - 8, i + 1);
      const cyclePriceLow = low.slice(i - 8, i + 1);
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
    for (let i = 8; i < k.length; i++) {
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

    close.splice(0, day90Index);
    date.splice(0, day90Index);
    k.splice(0, day90Index);
    d.splice(0, day90Index);
    diff.splice(0, day90Index);
    note.splice(0, day90Index);
    return res.json({ date, k, d, diff, note, close });
  } catch (error) {
    next(error);
  }
});

router.get("/stock/:id/rsi", authenticator, async (req, res, next) => {
  try {
    // 取得特定id 資料
    const { id } = req.params;
    const { timestamp, price, tradeDay90 } = await getStock180(id);

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
    const day90Index = date.indexOf(formattedDate(tradeDay90));

    // 畫 RSI (6, 12)
    // RSI (相對強弱指標) = n日漲幅平均值÷(n日漲幅平均值+ n日跌幅平均值) × 100
    // n日漲幅平均值 = n日內上漲日總上漲幅度加總 ÷ n
    // n日跌幅平均值 = n日內下跌日總下跌幅度加總 ÷ n
    const RSI5 = new Array(6).fill(null),
      RSI10 = new Array(12).fill(null);
    let up5 = 0,
      down5 = 0,
      up10 = 0,
      down10 = 0;
    // RSI5 計算(EMA)
    for (let i = 1; i <= close.length; i++) {
      let diff = (close[i] - close[i - 1]) / 6;
      if (i < 7) {
        if (diff >= 0) {
          up5 += diff;
        } else {
          down5 += diff;
        }
      }
      if (i === 6) {
        RSI5.push(Number(((up5 / (up5 - down5)) * 100).toFixed(2)));
      }
      if (i >= 7) {
        if (diff >= 0) {
          up5 += (diff - up5) / 6;
          down5 += (0 - down5) / 6;
        } else {
          up5 += (0 - up5) / 6;
          down5 += (diff - down5) / 6;
        }
        RSI5.push(Number(((up5 / (up5 - down5)) * 100).toFixed(2)));
      }
    }

    // RSI10 計算(EMA)
    for (let i = 1; i <= close.length; i++) {
      let diff = (close[i] - close[i - 1]) / 12;
      if (i < 13) {
        if (diff >= 0) {
          up10 += diff;
        } else {
          down10 += diff;
        }
      }
      if (i === 12) {
        RSI10.push(Number(((up10 / (up10 - down10)) * 100).toFixed(2)));
      }
      if (i >= 13) {
        if (diff >= 0) {
          up10 += (diff - up10) / 12;
          down10 += (0 - down10) / 12;
        } else {
          up10 += (0 - up10) / 12;
          down10 += (diff - down10) / 12;
        }
        RSI10.push(Number(((up10 / (up10 - down10)) * 100).toFixed(2)));
      }
    }
    // 取近90日資料
    close.splice(0, day90Index);
    date.splice(0, day90Index);
    RSI5.splice(0, day90Index);
    RSI10.splice(0, day90Index);

    const note = [];
    // 每日RSI分析結果
    for (let i = 0; i < RSI10.length; i++) {
      let dateNote = "";
      if (RSI5[i] > RSI10[i] && RSI5[i - 1] < RSI10[i - 1]) {
        dateNote += "黃金交叉";
      }
      if (RSI5[i] < RSI10[i] && RSI5[i - 1] > RSI10[i - 1]) {
        dateNote += "死亡交叉";
      }
      if (RSI5[i] >= 80 && RSI5[i]) {
        if (dateNote.length >= 4) {
          dateNote += "、超買";
        } else {
          dateNote += "超買";
        }
      }
      if (RSI5[i] <= 20 && RSI5[i]) {
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

router.get("/stock/:id/macd", authenticator, async (req, res, next) => {
  try {
    // 取得特定id 資料
    const { id } = req.params;
    const { timestamp, price, tradeDay90 } = await getStock180(id);

    // 取得繪圖、計算macd必須資料 date, high, low, close
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
    const tradeDay90Index = date.indexOf(formattedDate(tradeDay90));

    // MACD(12,26,9)
    // EMA(n)=(前一日EMA(n) × (n-1)+今日收盤價 × 2) ÷ (n+1)
    // EMA(m)=(前一日EMA(m) × (m-1)+今日收盤價 × 2) ÷ (m+1)
    // 快線 DIF=EMA(n)－EMA(m)
    // 慢線 MACD(x)=(前一日xMACD × (x-1)+DIF × 2) ÷ (x+1)
    // OSC 柱狀圖
    const EMA12 = new Array(11).fill(null),
      EMA26 = new Array(25).fill(null),
      n = 12,
      m = 26,
      k = 9,
      DIF = new Array(25).fill(null),
      MACD = new Array(33).fill(null),
      OSC = new Array(33).fill(null);
    let sum12 = 0,
      sum26 = 0;
    for (let i = 0; i < close.length; i++) {
      // 計算 EMA12
      if (i < n) {
        sum12 += close[i];
      }
      if (i === n - 1) {
        EMA12.push(sum12 / n);
      }
      if (i > n - 1) {
        sum12 = (EMA12[i - 1] * (n - 1) + close[i] * 2) / (n + 1);
        EMA12.push(sum12);
      }

      // 計算 EMA26 DIF
      if (i < m - 1) {
        sum26 += close[i];
      }
      if (i === m - 1) {
        EMA26.push(sum26 / m);
        let diff = (sum12 - sum26).toFixed(3);
        DIF.push(Number(diff));
      }
      if (i > m - 1) {
        sum26 = (EMA26[i - 1] * (m - 1) + close[i] * 2) / (m + 1);
        EMA26.push(sum26);
        let diff = (sum12 - sum26).toFixed(3);
        DIF.push(Number(diff));
      }
      // 計算 MACD
      // MACD(x)=(前一日xMACD × (x-1)+DIF × 2) ÷ (x+1)
      if (i === m + k - 2) {
        let DIF9 = DIF.slice(m + k - 9, m + k);
        let sum = DIF9.reduce((acc, cur) => acc + cur, 0);
        MACD.push(Number((sum / k).toFixed(3)));
        OSC.push(Number((DIF[i] - MACD[i]).toFixed(3)));
      }
      if (i > m + k - 2) {
        let sum = (Number(MACD[i - 1]) * (k - 1) + DIF[i] * 2) / (k + 1);
        MACD.push(Number(sum.toFixed(3)));
        OSC.push(Number((DIF[i] - MACD[i]).toFixed(3)));
      }
    }
    close.splice(0, tradeDay90Index);
    EMA12.splice(0, tradeDay90Index);
    EMA26.splice(0, tradeDay90Index);
    date.splice(0, tradeDay90Index);
    DIF.splice(0, tradeDay90Index);
    MACD.splice(0, tradeDay90Index);
    OSC.splice(0, tradeDay90Index);
    const note = [];
    // 每日 MACD 分析結果
    for (let i = 0; i < date.length; i++) {
      let dateNote = "";
      if (DIF[i] > MACD[i] && DIF[i - 1] < MACD[i - 1]) {
        dateNote += "黃金交叉";
      }
      if (DIF[i] < MACD[i] && DIF[i - 1] > MACD[i - 1]) {
        dateNote += "死亡交叉";
      }
      if (!dateNote.length) {
        dateNote += "--";
      }
      note.push(dateNote);
    }

    return res.json({ close, date, EMA12, EMA26, note, DIF, MACD, OSC });
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
    console.log(last);
    let [max, min] = [
      Math.max(...high.slice(0, high.length - last)),
      Math.min(...low.slice(0, low.length - last)),
    ];
    [max, min] = [
      Math.ceil(max + (max - min) * 0.1),
      Math.floor(min - (max - min) * 0.5),
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
