const express = require("express");
const router = express.Router();
const userController = require("../controllers/user-controller");
const ezSelect = require("./modules/ezSelect");

router.use("/stock/ezSelect", ezSelect);

router.get("/stock/login", (req, res) => {
  res.render("login");
});

router.get("/stock/signup", (req, res) => {
  res.render("signup");
});

router.get("/stock/index", (req, res) => {
  res.render("index");
});

module.exports = router;
