const axios = require("axios");
const { taiwanTime } = require("./date");

// 取得個股本月價格資訊
const getStock = async function (stockNo) {
  // 日期
  let tradeDay = taiwanTime.format("YYYYMMDD");
  let url =
    "http://www.twse.com.tw/exchangeReport/STOCK_DAY?response=json&date=" +
    tradeDay +
    "&stockNo=" +
    stockNo;

  try {
    let n = 1;
    let response = await axios.get(url);
    let data = response.data;
    while (data.total < 20) {
      tradeDay = taiwanTime.clone().subtract(n, "month").format("YYYYMMDD");
      url =
        "http://www.twse.com.tw/exchangeReport/STOCK_DAY?response=json&date=" +
        tradeDay +
        "&stockNo=" +
        stockNo;
      const lastMonthResponse = await axios.get(url);
      const lastMonthData = lastMonthResponse.data;
      console.log(data);
      console.log("-----------------------");
      console.log(lastMonthData);
      const concatDate = lastMonthData.slice(0, 20 - data.data.length);
      data.concat(concatDate);

      n++;
    }
    return data;
  } catch (error) {
    console.error("Error occurred while fetching data:", error);
  }
};

// 外資今日買超
const getForeignBuy = async function () {
  //日期
  let tradeDay = taiwanTime.format("YYYYMMDD");
  console.log(tradeDay);
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
