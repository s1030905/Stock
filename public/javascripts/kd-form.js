// 監聽 "News" 的點擊事件
const kdFormBtn = document.querySelector("#kd-form");

const getStockKD = async () => {
  // 移除原先的列表
  const table = document.querySelector("table");
  table.remove();
  // 取得stockId
  const queryString = window.location.search;
  const stockIdIndex = queryString.indexOf("=");
  const stockId = queryString.slice(stockIdIndex + 1, queryString.length);

  // 發送 API 請求
  const response = await fetch(`/api/stock/${stockId}/kd`);
  const { date, k, d, note, diff, close } = await response.json();
  // 表格訊息
  let kdList = ``;
  let [buyPrice, sellPrice, profit] = [0, 0, 0];
  for (let i = 0; i < date.length; i++) {
    const tradeSign = note[i].slice(0, 4);

    if (tradeSign === "黃金交叉") {
      buyPrice = close[i];
    } else if (tradeSign === "死亡交叉" && buyPrice > 0) {
      sellPrice = close[i];
      profit = (sellPrice - buyPrice).toFixed(2);
      [buyPrice, sellPrice] = [0, 0];
    }
    if (profit !== 0) {
      kdList += `
      <tr>
        <th scope="row">${i + 1}</th>
        <td>${date[i]}</td>
        <td>${k[i]}</td>
        <td>${d[i]}</td>
        <td>${diff[i]}</td>
        <td>${note[i]} 預估獲利: ${profit}</td>
      </tr>`;
      profit = 0;
    } else {
      kdList += `
      <tr>
        <th scope="row">${i + 1}</th>
        <td>${date[i]}</td>
        <td>${k[i]}</td>
        <td>${d[i]}</td>
        <td>${diff[i]}</td>
        <td>${note[i]}</td>
      </tr>`;
    }
  }
  // 更新table
  const kdContainer = document.querySelector("#table-container");
  kdContainer.innerHTML = `<table class="table">
  <thead>
    <tr>
      <th scope="col">#</th>
      <th scope="col">時間</th>
      <th scope="col">K值</th>
      <th scope="col">D值</th>
      <th scope="col">差值</th>
      <th scope="col">買賣訊號</th>
    </tr>
  </thead>
  <tbody>
    ${kdList}
  </tbody>
</table>`;
};

kdFormBtn.addEventListener("click", (event) => {
  // 取消其他標籤的 active 狀態
  const activeTabs = document.querySelectorAll(".nav-item .nav-link.active");
  activeTabs.forEach((tab) => {
    tab.classList.remove("active");
  });

  event.target.classList.add("active");
  getStockKD();
});
