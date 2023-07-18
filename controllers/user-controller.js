const bcrypt = require("bcryptjs");
const { User } = require("../models");

const userController = {
  signUP: async (req, res, next) => {
    try {
      const errors = [];
      const { name, account, password, passwordCheck } = req.body;
      if ((!name || !account, !password, !passwordCheck))
        errors.push = "每個欄位都必填";
      if (password !== passwordCheck) errors.push("密碼與確認密碼不一致");
      const user = await User.findOne({ where: { account } });
      if (user) errors.push("該帳號已被註冊");
      if (errors.length > 0) {
        req.flash("error_messages", errors);
        return res.redirect("/signup");
      }
      await User.create({
        name,
        account,
        password: bcrypt.hashSync(password, bcrypt.genSaltSync(10), null),
      });
      return res.redirect("/");
    } catch (error) {
      next(error);
    }
  },
  login: (req, res, next) => {
    try {
      return res.redirect("/");
    } catch (error) {
      next(error);
    }
  },
};

module.exports = { userController };
