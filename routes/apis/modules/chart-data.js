const router = require("express").Router();
const { getStock } = require("../helpers/stock");
const { formattedDate } = require("../helpers/date");

router.get("/api/chatData", async (req, res) => {
  const { response, timestamp, price } = await getStock(2330);
  const date = [];
  const openEnd = [];
  const high = price[0].high;
  const low = price[0].low;
  const color = [];
  const max = Math.max(...high);
  const min = Math.min(...low);
  timestamp.forEach((e) => {
    date.push(formattedDate(e));
  });
  for (let i = 0; i < price[0].open.length; i++) {
    let start = price[0].open[i];
    let end = price[0].close[i];
    openEnd.push([start, end]);
    if (end > start) {
      color.push("red");
    } else if (end < start) {
      color.push("green");
    } else {
      color.push("black");
    }
  }
  res.json("myChart", {
    date,
    openEnd: [openEnd],
    high,
    low,
    max,
    min,
    color,
  });
});

module.exports = router;
