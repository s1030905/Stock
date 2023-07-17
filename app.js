require("dotenv").config();

// 套件引入
const express = require("express");
const handlebars = require("express-handlebars");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");

// 自訂模組
const { pages, apis } = require("./routes");
const handlebarsHelpers = require("./helpers/handlebars-helpers");
const passport = require("./config/passport");

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
app.use(express.static("public"));

// session setting
app.use(
  session({
    secret: process.env.SESSION_SECRET || "NoSecret",
    resave: false,
    saveUninitialized: true,
  })
);

// passport初始化
app.use(passport.initialize());
app.use(passport.session());

// flash
app.use(flash());
app.use((req, res, next) => {
  // console.log("----------------------------------req.user");
  // console.log(req.user);
  res.locals.user = req.user;
  res.locals.isAuthenticated = req.isAuthenticated();
  res.locals.error_messages = req.flash("error_messages");
  next();
});

app.use("/api", apis);
app.use(pages);

// listen on port
app.listen(port, () => {
  console.log(`listening on http://localhost:${port}`);
});
