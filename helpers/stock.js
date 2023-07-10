const axios = require("axios");
const { taiwanTime, todayStart } = require("./date");

// 取得個股本月價格資訊
const getStock = async function (stockNo) {
  // 日期
  let tradeDay = todayStart;
  let tradeDay30 = todayStart - 2592000;
  try {
    let url = `https://query1.finance.yahoo.com/v8/finance/chart/${stockNo}.TW?period1=${tradeDay30}&period2=${tradeDay}&interval=1d&events=history`;
    let stock = await axios.get(url);
    let response = stock.data.chart.result;
    let timestamp = response[0].timestamp;
    let price = response[0].indicators.quote;
    return { response, timestamp, price };
  } catch (error) {
    console.error("Error occurred while fetching data:", error);
  }
};
// 外資今日買超
const getForeignBuy = async function () {
  //日期
  let tradeDay = taiwanTime.format("YYYYMMDD");
  // api
  let url =
    "https://www.twse.com.tw/rwd/zh/fund/TWT38U?date=" +
    tradeDay +
    "&response=json";
  try {
    let n = 1;
    let response = await axios.get(url);
    let data = response.data;
    while (data.total === 0) {
      tradeDay = taiwanTime.clone().subtract(n, "day").format("YYYYMMDD");
      url =
        "https://www.twse.com.tw/rwd/zh/fund/TWT38U?date=" +
        tradeDay +
        "&response=json";
      response = await axios.get(url);
      data = response.data;
      n++;
    }
    return response;
  } catch (error) {
    console.error("Error occurred while fetching data:", error);
  }
};

// 投信今日買超
const getLocalBuy = async function () {
  //日期
  let tradeDay = taiwanTime.format("YYYYMMDD");
  const url = `https://www.twse.com.tw/rwd/zh/fund/TWT44U?date=${{
    tradeDay,
  }}&response=json`;
  try {
    let n = 1;
    let response = await axios.get(url);
    let data = response.data;
    while (data.total === 0) {
      tradeDay = taiwanTime.clone().subtract(n, "day").format("YYYYMMDD");
      url =
        "https://www.twse.com.tw/rwd/zh/fund/TWT44U?date=" +
        tradeDay +
        "&response=json";
      response = await axios.get(url);
      data = response.data;
      n++;
    }
    return response;
  } catch {
    console.error("Error occurred while fetching data:", error);
  }
};

const stockList = async function () {
  const url = "https://openapi.twse.com.tw/v1/get_exchangeReport/BWIBBU_ALL";
  const response = await axios.get(url);
  const data = response.data;
  const dic = {};
  data.forEach((element) => {
    dic[element["Code"]] = {
      stockId: element["Code"],
      name: element["Name"],
      PEratio: element["PEratio"],
      DividendYield: element["DividendYield"],
      PBratio: element["PBratio"],
    };
  });
  return dic;
};

module.exports = {
  getStock,
  getForeignBuy,
  getLocalBuy,
  stockList,
};
