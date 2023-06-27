const { getPrice } = require("../helpers/stock");
const fiftyData = require("../fifty.json");

const stockController = {
  fifty: async (req, res) => {
    fiftyData;
  },
  fiftySix: async (req, res) => {
    // const data = await getPrice();
    // console.log(data);
    // res.send(data);
    res.render("index");
  },
  homePage: (req, res) => {
    res.render("index");
  },
};

module.exports = { stockController };
