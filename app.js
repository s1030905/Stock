require("dotenv").config();

// 套件引入
const express = require("express");
const handlebars = require("express-handlebars");

// 自訂
const router = require("./routes");
const handlebarsHelpers = require("./helpers/handlebars-helpers");

// 變數
const port = process.env.PORT || 3000;
const app = express();

// view engine設定
app.set("view engine", "hbs");
app.engine("hbs", handlebars({ extname: ".hbs", helpers: handlebarsHelpers }));

app.use(router);

// listen on port
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
