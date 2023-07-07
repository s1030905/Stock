const moment = require("moment-timezone");

// 取得當前時間的 Moment 物件
const taiwanTime = moment().tz("Asia/Taipei");

// 取得自1970年至今的秒數
const date = moment();
const todayStart = date.startOf("day").unix();

// 秒數格式更改為年月日
const formattedDate = function (timestamp) {
  const date = new Date(timestamp * 1000);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}${month}${day}`;
};

// 取得星期幾
const dayOfWeek = taiwanTime.format("dddd");

module.exports = { taiwanTime, todayStart, formattedDate };
