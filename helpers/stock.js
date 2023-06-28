const axios = require("axios");

// 股票代碼
const stockNo = 2330;

// 今天日期
const date = new Date();
let year = date.getFullYear();
let month = date.getMonth() + 1;
let day = date.getDate();

if (month < 10) {
  month = "0" + month;
}
if (day < 10) {
  day = "0" + day;
}

const today = year + "" + month + "" + day;

// 取得個股價格資訊
const getPrice = async function () {
  const url =
    "http://www.twse.com.tw/exchangeReport/STOCK_DAY?response=json&date=" +
    today +
    "&stockNo=" +
    stockNo;
  try {
    const response = await axios.get(url);
    const data = response.data;

    // 資料不足5筆
    if (data.total < 5) {
      // 年初
      if (month === "01") {
        const lastYear = Number(year) - 1;
        const yesterday = lastYear + "1231";
        const url =
          "http://www.twse.com.tw/exchangeReport/STOCK_DAY?response=json&date=" +
          yesterday +
          "&stockNo=" +
          stockNo;
        const res = await axios.get(url);
        let lastData = res.data.data;
        lastData = lastData.slice(
          lastData.length - (5 - data.total),
          lastData.length + 1
        );
        data.data.push(lastData);
        console.log(data);
        return data;
      } else {
        // 月初
        let lastMonth = Number(month) - 1;
        if (lastMonth < 10) {
          lastMonth = "0" + lastMonth;
        }
        lastMonth = lastMonth.toString();
        const today = year + lastMonth + "01";
        const url =
          "http://www.twse.com.tw/exchangeReport/STOCK_DAY?response=json&date=" +
          today +
          "&stockNo=" +
          stockNo;
        const res = await axios.get(url);
        let lastData = res.data.data;
        lastData = lastData.slice(
          lastData.length - (5 - data.total),
          lastData.length + 1
        );
        data.data.push(lastData);
        console.log(data);
        return data;
      }
    } else {
      const arr = [];
      data.data.forEach((element) => {
        arr.push(element[7]);
      });
      return data.title;
      // console.log(arr);
    }
  } catch (error) {
    console.error("Error occurred while fetching data:", error);
  }
};

const getForeignBuy = async function () {
  const url = `https://www.twse.com.tw/rwd/zh/fund/TWT38U?date=20230627&response=json`; //${today}
  try {
    let data = await axios.get(url);
    data = data.data;
    return data;
  } catch (error) {
    console.error("Error occurred while fetching data:", error);
  }
};

const getLocalBuy = async function () {
  const url = `https://www.twse.com.tw/rwd/zh/fund/TWT44U?date=20230619&response=json`; //${today}
  try {
    let data = await axios.get(url);
    data = data.data;
    return data;
  } catch (error) {
    console.error("Error occurred while fetching data:", error);
  }
};

module.exports = { getPrice, getForeignBuy, getLocalBuy };
