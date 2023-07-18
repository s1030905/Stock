const request = require("request");
const cheerio = require("cheerio");

const crawler = async (stockName) => {
  const keyword = encodeURIComponent(stockName);
  let url = `https://money.udn.com/search/result/1001/${keyword}`;

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
        for (let i = 0; i < 20; i++) {
          const title = newsList.eq(i).find(".story__headline").text().trim();
          const date = newsList.eq(i).find(".story__content time").text();
          const link = newsList.eq(i).find(".story__content a").attr("href");
          data.push({ title, date, link });
        }
        resolve(data);
      }
    );
  });
};

module.exports = { crawler };
