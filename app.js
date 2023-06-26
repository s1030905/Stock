if (process.env.NODE_ENV !== "production") {
  // 如果不是 production 模式
  require("dotenv").config(); // 使用 dotenv 讀取 .env 檔案
}

const express = require("express");
const app = express();
const linebot = require("linebot"); // 判別開發環境

const bot = linebot({
  channelId: process.env.CHANNEL_ID,
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
});

const linebotParser = bot.parser();

bot.on("message", function (event) {
  console.log(event);
  event
    .reply(event.message.text)
    .then(function (data) {
      // success
    })
    .catch(function (error) {
      // error
    });
});

app.post("/", linebotParser);

app.listen(process.env.PORT || 3000, () => {
  console.log("Express server start");
});
