const axios = require("axios");
const { taiwanTime, todayStart } = require("./date");

// 取得個股近90日價格資訊
const getStock = async function (stockNo) {
  // 日期
  let tradeDay = todayStart;
  let tradeDay90 = todayStart - 7776000;
  let url = `https://query1.finance.yahoo.com/v8/finance/chart/${stockNo}.TW?period1=${tradeDay90}&period2=${tradeDay}&interval=1d&events=history`;

  // 獲取資料
  let stock = await axios.get(url);
  let response = stock.data.chart;
  if (response.result === null) {
    let timestamp = null;
    let price = null;
    return { response, timestamp, price };
  }
  let timestamp = response.result[0].timestamp;
  let price = response.result[0].indicators.quote;
  return { response, timestamp, price };
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
    // 如果今日沒有數據就獲取前一天的
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
    // 如果今日沒有數據就獲取前一天的
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
  // 一般上市櫃公司
  const url = "https://openapi.twse.com.tw/v1/get_exchangeReport/BWIBBU_ALL";
  // ETF
  const ETFurl =
    "https://mis.twse.com.tw/stock/api/getCategory.jsp?ex=tse&i=B0";

  // 獲取資料
  const [response, responseETF] = await Promise.all([
    axios.get(url),
    axios.get(ETFurl),
  ]);
  const [data, dataETF] = [response.data, responseETF.data["msgArray"]];
  // 建立字典
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
  dataETF.forEach((element) => {
    const stockId = element["ch"].slice(0, -3);
    dic[stockId] = {
      stockId: element["Code"],
      name: element["n"],
    };
  });
  return dic;
};

// 取得個股近270日價格資訊
const getStock180 = async function (stockNo) {
  // 日期
  let tradeDay = todayStart;
  let tradeDay360 = todayStart - 7776000 * 4;
  let tradeDay90 = todayStart - 7776000;
  let url = `https://query1.finance.yahoo.com/v8/finance/chart/${stockNo}.TW?period1=${tradeDay360}&period2=${tradeDay}&interval=1d&events=history`;

  // 獲取資料
  let stock = await axios.get(url);
  let response = stock.data.chart;
  if (response.result === null) {
    let timestamp = null;
    let price = null;
    return { response, timestamp, price };
  }
  let timestamp = response.result[0].timestamp;
  let price = response.result[0].indicators.quote;
  return { response, timestamp, price, tradeDay90 };
};

// 取得大盤資訊
const getIndex = async () => {
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
  return { data, title, day };
};

module.exports = {
  getStock,
  getForeignBuy,
  getLocalBuy,
  stockList,
  getStock180,
  getIndex,
};
