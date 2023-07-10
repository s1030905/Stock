const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const passportJWT = require("passport-jwt");
const bcrypt = require("bcryptjs");
const { User, Stock } = require("../models");

// LocalStrategy setting
passport.use(
  new LocalStrategy(
    {
      usernameField: "account",
      passwordField: "password",
      passReqToCallback: true,
    },
    async (req, account, password, cb) => {
      try {
        const user = await User.findOne({ where: { account } });
        if (!user) {
          return cb(null, false, req.flash("error_messages", "帳號或密碼錯誤"));
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return cb(null, false, req.flash("error_messages", "帳號或密碼錯誤"));
        }
        cb(null, user);
      } catch (error) {
        return cb(error);
      }
    }
  )
);

// serializeUser & deserializeUser
passport.serializeUser((user, cb) => {
  return cb(null, user.id);
});
passport.deserializeUser(async (id, cb) => {
  try {
    const user = await User.findByPk(id, {
      nest: true,
      include: [{ model: Stock }],
    });
    const userData = user.dataValues;
    delete userData.password;
    return cb(null, userData);
  } catch (error) {
    return cb(error);
  }
});

module.exports = passport;
