require("dotenv").config();

// 套件引入
const express = require("express");
const handlebars = require("express-handlebars");
const methodOverride = require("method-override");

// 自訂模組
const router = require("./routes");
const handlebarsHelpers = require("./helpers/handlebars-helpers");

// 變數軒高
const port = process.env.PORT || 3000;
const app = express();

// view engine設定
app.set("view engine", "hbs");
app.engine("hbs", handlebars({ extname: ".hbs", helpers: handlebarsHelpers }));

// 解析請求
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

app.use(router);

// listen on port
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
