const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const passportJWT = require("passport-jwt");
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const bcrypt = require("bcryptjs");
const { User } = require("../models");

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
        return cb(null, user);
      } catch (error) {
        return cb(error);
      }
    }
  )
);

// JWTStrategy setting

const jwtOptions = {
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};
passport.use(
  new JWTStrategy(jwtOptions, async (jwtPayload, cb) => {
    try {
      const user = await User.findByPk(jwtPayload.id);
      return cb(null, user);
    } catch (error) {
      return cb(error);
    }
  })
);

passport.serializeUser((user, cb) => {
  cb(null, user.id);
});
passport.deserializeUser(async (id, cb) => {
  try {
    const user = await User.findByPk(id, { raw: true });
    return cb(null, user);
  } catch (error) {
    return cb(error);
  }
});

module.exports = passport;
