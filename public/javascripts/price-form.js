// 監聽 "price-form" 的點擊事件
const priceFormBtn = document.querySelector("#price");

const getPriceForm = async () => {
  // 移除原先的列表
  const table = document.querySelector("table");
  table.remove();
  // 取得stockId
  const queryString = window.location.search;
  const stockIdIndex = queryString.indexOf("=");
  const stockId = queryString.slice(stockIdIndex + 1, queryString.length);

  // 發送 API 請求
  const response = await fetch(`/api/stock/${stockId}`);
  const { date, open, close, high, low, volumeRelative } =
    await response.json();
  const diff = ["--"];
  // 表格訊息
  let priceList = ``;
  for (let i = 0; i < date.length; i++) {
    if (i > 0) diff.push((close[i] - close[i - 1]).toFixed(2));
    priceList += `
      <tr>
        <th scope="row">${i + 1}</th>
        <td>${date[i]}</td>
        <td>${volumeRelative[i]}</td>
        <td>${open[i].toFixed(2)}</td>
        <td>${high[i].toFixed(2)}</td>
        <td>${low[i].toFixed(2)}</td>
        <td>${close[i].toFixed(2)}</td>
        <td>${diff[i]}</td>
      </tr>`;
  }

  // 更新table
  const kdContainer = document.querySelector("#table-container");
  kdContainer.innerHTML = `<table class="table">
  <thead>
    <tr>
      <th scope="col">#</th>
      <th scope="col">時間</th>
      <th scope="col">成交股數</th>
      <th scope="col">開盤價</th>
      <th scope="col">最高價</th>
      <th scope="col">最低價</th>
      <th scope="col">收盤價</th>
      <th scope="col">漲跌價差</th>
    </tr>
  </thead>
  <tbody>
    ${priceList}
  </tbody>
</table>`;
};

priceFormBtn.addEventListener("click", (event) => {
  // 取消其他標籤的 active 狀態
  const activeTabs = document.querySelectorAll(".nav-item .nav-link.active");
  activeTabs.forEach((tab) => {
    tab.classList.remove("active");
  });
  event.target.classList.add("active");
  // 表格
  getPriceForm();
});
