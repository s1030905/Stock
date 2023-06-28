const { getForeignBuy, getLocalBuy } = require("../helpers/stock");
const fiftyData = require("../fifty.json");
const fiftySixData = require("../fiftysix.json");

const stockController = {
  fifty: async (req, res) => {
    const data = fiftyData.data;
    res.render("stock-list", { data });
  },
  fiftySix: async (req, res) => {
    const data = fiftySixData.data;
    res.render("stock-list", { data });
  },
  homePage: (req, res) => {
    // 代處理

    res.render("index");
  },
  foreignBuy: async (req, res) => {
    // 發apis獲取資料
    let data = await getForeignBuy();

    // 錯誤處理
    if (data.stat !== "OK") {
      const errMsg = "今日盤後資訊尚未整理完成";
      return res.render("stock-list", { errMsg });
    }

    // 資料處理
    data = data.data.slice(0, 50);
    const transformedData = {};
    data.forEach((element) => {
      transformedData[element[1]] = {
        id: element[1],
        name: element[2],
        buy: element[3],
        sell: element[4],
        difference: element[5],
      };
    });

    res.render("stock-list-buy", { transformedData });
  },
  localBuy: async (req, res) => {
    // 發apis獲取資料
    let data = await getLocalBuy();

    // 錯誤處理
    if (data.stat !== "OK") {
      const errMsg = "今日盤後資訊尚未整理完成";
      return res.render("stock-list", { errMsg });
    }

    // 資料處理
    data = data.data.slice(0, 50);
    const transformedData = {};
    data.forEach((element) => {
      transformedData[element[1]] = {
        id: element[1],
        name: element[2],
        buy: element[3],
        sell: element[4],
        difference: element[5],
      };
    });

    res.render("stock-list-buy", { transformedData });
  },
};

module.exports = { stockController };
