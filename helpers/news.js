const request = require("request");
const cheerio = require("cheerio");

// 爬單一頁面新聞
const crawler = async (stockName, url) => {
  return new Promise((resolve, reject) => {
    request(
      {
        url: url,
        method: "GET",
      },
      (error, res, body) => {
        if (error || !body) {
          reject(error);
          return;
        }
        const $ = cheerio.load(body);
        const newsList = $(".story-headline-wrapper");
        const data = [];
        // 找新聞 title/date/link
        for (let i = 0; i < newsList.length; i++) {
          const title = newsList.eq(i).find(".story__headline").text().trim();
          const date = newsList.eq(i).find(".story__content time").text();
          const link = newsList.eq(i).find(".story__content a").attr("href");
          // 逐一確認title是否符合股票名稱
          for (let j = 0; j < title.length - stockName.length; j++) {
            const subString = title.slice(j, j + stockName.length);
            if (subString === stockName) {
              data.push({ title, date, link });
            }
          }
        }
        resolve(data);
      }
    );
  });
};

// 爬特定股票新聞
const getStockNews = async (stockName, page = 1) => {
  const keyword = encodeURIComponent(stockName);
  let data = [];
  let target = 10;
  // 找10個相關新聞
  while (data.length < target) {
    let url = `https://money.udn.com/search/result/1001/${keyword}/${page}`;
    let pageNews = await crawler(stockName, url);
    data = data.concat(pageNews);
    // 若相關新聞太少，找5頁就好
    if (page >= 5 && data.length < target) {
      return data;
    }
    if (data.length > target) {
      data.splice(target - data.length);
    }
    page++;
  }
  return data;
};
module.exports = { getStockNews };
