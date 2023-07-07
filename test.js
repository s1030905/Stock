const axios = require("axios");
const url = "https://openapi.twse.com.tw/v1/get_exchangeReport/BWIBBU_ALL";
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
const yahooFinance = require("yahoo-finance2").default;
require = require("esm")(module);
const stockChart = require("./helpers/stockChart.mjs");
console.log(stockChart());

async function getStockInfo() {
  try {
    // const stockInfo = await yahooFinance.quote({
    //   symbol: "2330.TW", // 股票代號.TW
    //   modules: ["price", "summaryDetail"],
    // });
    const stockInfo = await yahooFinance.quote("AAPL");
    // console.log(stockInfo);
  } catch (error) {
    console.error(error);
  }
}

getStockInfo();
