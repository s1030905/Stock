const moment = require("moment-timezone");

// 取得當前時間的 Moment 物件
const taiwanTime = moment().tz("Asia/Taipei");

// 取得自1970年至今的秒數
const date = moment();
const secondsSince1970 = date.unix();
console.log(secondsSince1970);

// 取得星期幾
const dayOfWeek = taiwanTime.format("dddd");

// const tradeDay = taiwanTime.clone().subtract(3, "day").format("YYYYMMDD");
// console.log(tradeDay);
module.exports = { taiwanTime };
