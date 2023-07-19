const errorHandler = (err, req, res, next) => {
  if (err.response && err.response.status === 404) {
    req.flash("error_messages", `請輸入正確股票代號`);
  } else {
    req.flash("error_messages", `${err}`);
  }
  res.redirect("back");
  next(err);
};
const apiErrorHandler = (err, req, res, next) => {
  if (err instanceof Error) {
    req.flash("error_messages", `請輸入正確股票代號`);
  } else {
    req.flash("error_messages", `請輸入正確股票代號`);
  }
  res.redirect("back");
  next(err);
};
module.exports = { errorHandler, apiErrorHandler };
