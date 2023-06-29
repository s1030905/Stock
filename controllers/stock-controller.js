const { getForeignBuy, getLocalBuy } = require("../helpers/stock");
const fiftyData = require("../fifty.json");
const fiftySixData = require("../fiftysix.json");
const { User, Stock } = require("../models");

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
  userStock: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const data = await Stock.findAll({ where: { userId }, raw: true });
      if (!data.length) {
        req.flash("error_messages", "你的自選股清單跟你的財富一樣");
        res.render("userStock", { data });
      }
      res.render("userStock", { data });
    } catch (error) {
      next(error);
    }
  },
  addStock: async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      console.log(userId);
      const [stocks, stock] = await Promise.all([
        Stock.findAll({ where: { userId } }),
        Stock.findOne({ where: { userId, stockId: id } }),
      ]);
      if (stock) {
        req.flash("error_messages", "已在你的清單內");
        return res.render("userStock");
      } else {
        Stock.create({
          userId,
          stockId: id,
        });
        return res.redirect("/stock/userStock");
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
};

module.exports = { stockController };
