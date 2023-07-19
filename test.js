const axios = require("axios");
// 大盤行情
//  "https://openapi.twse.com.tw/v1/get_exchangeReport_BWIBBU_ALL"
// 大盤行情
// "https://openapi.twse.com.tw/v1/exchangeReport/MI_INDEX"
// 本益比
// "https://openapi.twse.com.tw/v1/get_exchangeReport/BWIBBU_ALL"
// 昨日成交
// "https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_ALL"
// 個股成交與月均價
// "https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_AVG_ALL"

// (async () => {
//   const res = await axios.get(url);
//   data = res.data.slice(0, 10);
//   console.log(data);
// })();

// async function getStockInfo() {
//   try {
//     let url =
//       "https://query1.finance.yahoo.com/v8/finance/chart/2330.TW?period1=1686153600&period2=1688745600&interval=1d&events=history";
//     const stockInfo = await axios.get(url);
//     console.log(stockInfo.data);
//   } catch (error) {
//     console.error(error);
//   }
// }

// getStockInfo();
const a = "?stockId=00878";
const b = "台積電";
const l = a.indexOf("=");
console.log(a.indexOf("="));
console.log(a.slice(l));
// -------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------

// let url = `https://www.twse.com.tw/rwd/zh/afterTrading/STOCK_DAY?date=${tradeDay}&stockNo=${stockNo}&response=json`;
