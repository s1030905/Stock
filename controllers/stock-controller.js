const { getForeignBuy, getLocalBuy } = require("../helpers/stock");
const fiftyData = require("../fifty.json");
const fiftySixData = require("../fiftysix.json");
const { Stock } = require("../models");
const { getStock, stockList } = require("../helpers/stock");

const stockController = {
  fifty: async (req, res) => {
    const data = fiftyData.data;
    res.render("stock-list", { data });
  },
  fiftySix: async (req, res) => {
    const data = fiftySixData.data;
    res.render("stock-list", { data });
  },
  foreignBuy: async (req, res) => {
    // 發apis獲取資料
    const response = await getForeignBuy();
    let data = response.data;
    const title = data.title;
    const date = data.date;

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
    return res.render("stock-list-buy", { transformedData, title, date });
  },
  localBuy: async (req, res) => {
    // 發apis獲取資料
    const response = await getLocalBuy();
    let data = response.data;
    const title = data.title;
    const date = data.date;

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

    res.render("stock-list-buy", { transformedData, title, date });
  },
  userStock: async (req, res, next) => {
    try {
      // 取得userStock資料
      const userId = req.user.id;
      const data = await Stock.findAll({ where: { userId }, raw: true });

      // PEratio/PBratio/DividendYield 數據獲取
      const stocks = await stockList();

      data.forEach((e) => {
        e.PEratio = stocks[e.stockId]["PEratio"];
        e.PBratio = stocks[e.stockId]["PBratio"];
        e.DividendYield = stocks[e.stockId]["DividendYield"];
      });
      console.log(data);
      // --------------------------------------------------------
      return res.render("userStock", { data });
    } catch (error) {
      next(error);
    }
  },
  addStock: async (req, res, next) => {
    try {
      // 尋找欲新增資料
      const { id } = req.params;
      const userId = req.user.id;
      const stock = await Stock.findOne({
        where: { userId, stockId: id },
        raw: true,
      });

      // 錯誤處理
      if (stock) {
        req.flash("error_messages", "已在你的清單內");
        const referer = req.headers.referer;
        return res.redirect(referer);
      } else {
        // 新增資料
        const stocks = await stockList();
        const name = stocks[id]["name"];
        Stock.create({
          userId,
          stockId: id,
          name,
        });
        req.flash("error_messages", "已新增至自選股清單");
        const referer = req.headers.referer;
        return res.redirect(referer);
      }
    } catch (error) {
      next(error);
    }
  },
  deleteStock: async (req, res, next) => {
    try {
      const { id } = req.params;
      const stock = await Stock.findByPk(id);
      if (!stock) {
        req.flash(
          "error_messages",
          "Oops! something wrong. You can't remove it"
        );
        return res.redirect("/stock/userStock");
      }
      await stock.destroy();
      return res.redirect("/stock/userStock");
    } catch (error) {
      next(error);
    }
  },
  search: async (req, res) => {
    let { stockId } = req.body;
    stockId = stockId.trim();

    // 輸入值得錯誤處理
    // 空白
    if (!stockId) {
      req.flash("error_messages", "請輸入正確股票代號");
      return res.redirect("/");
    }

    const response = await getStock(stockId);

    // 錯誤處理
    if (response.stat !== "OK") {
      req.flash("error_messages", "請輸入正確股票代號");
      return res.redirect("/");
    }

    //資料處理
    const obj = {};
    const data = response.data;
    const title = response.title;
    data.forEach((element) => {
      obj[element[0]] = {
        date: element[0],
        dealStock: element[1],
        dealMoney: element[2],
        start: element[3],
        hight: element[4],
        low: element[5],
        end: element[6],
        difference: element[7],
        dealNumber: element[8],
      };
    });
    // 畫圖
    // stockChart(data);
    return res.render("getStock", { data: obj, title });
  },
};

module.exports = { stockController };
