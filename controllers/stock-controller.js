const { getPrice } = require("../helpers/stock");
const fiftyData = require("../fifty.json");
const fiftySixData = require("../fiftysix.json");

const stockController = {
  fifty: async (req, res) => {
    const data = fiftyData.data;
    res.render("fifty", { data });
  },
  fiftySix: async (req, res) => {
    const data = fiftySixData.data;
    res.render("fiftySix", { data });
    res.render("index");
  },
  homePage: (req, res) => {
    // const data = await getPrice();
    // console.log(data);
    // res.send(data);
    res.render("index");
  },
};

module.exports = { stockController };
