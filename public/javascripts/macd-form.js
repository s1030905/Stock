// 監聽 "macd-form" 的點擊事件
const macdForm = document.querySelector("#macd-form");

const getStockMACD = async () => {
  // 移除原先的列表
  const table = document.querySelector("table");
  table.remove();
  // 取得stockId
  const queryString = window.location.search;
  const stockIdIndex = queryString.indexOf("=");
  const stockId = queryString.slice(stockIdIndex + 1, queryString.length);

  // 發送 API 請求
  const response = await fetch(`/api/stock/${stockId}/macd`);
  const { close, date, note, DIF, MACD } = await response.json();

  // 表格訊息
  let rsiList = ``;
  let [buyPrice, sellPrice, profit] = [0, 0, 0];
  let totalProfit = 0;
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
      rsiList += `
      <tr>
        <th scope="row">${i + 1}</th>
        <td>${date[i]}</td>
        <td>${DIF[i]}</td>
        <td>${MACD[i]}</td>
        <td>${note[i]} 預估獲利: ${profit}</td>
      </tr>`;
      totalProfit += Number(profit);
      profit = 0;
    } else {
      rsiList += `
      <tr>
        <th scope="row">${i + 1}</th>
        <td>${date[i]}</td>
        <td>${DIF[i]}</td>
        <td>${MACD[i]}</td>
        <td>${note[i]}</td>
      </tr>`;
    }
  }
  // 計算rsi 總獲利
  const total = document.querySelector("#total");
  total.innerHTML = `<h4 style="font-weight: 700">MACD策略共獲利: ${totalProfit.toFixed(
    2
  )}點</h4>`;
  // 更新table
  const tableContainer = document.querySelector("#table-container");
  tableContainer.innerHTML = `<table class="table">
  <thead>
    <tr>
      <th scope="col">#</th>
      <th scope="col">時間</th>
      <th scope="col">DIF</th>
      <th scope="col">MACD</th>
      <th scope="col">買賣訊號</th>
    </tr>
  </thead>
  <tbody>
    ${rsiList}
  </tbody>
</table>`;
};

macdForm.addEventListener("click", (event) => {
  // 取消其他標籤的 active 狀態
  const activeTabs = document.querySelectorAll(".nav-item .nav-link.active");
  activeTabs.forEach((tab) => {
    tab.classList.remove("active");
  });
  event.target.classList.add("active");
  const macdHeader = document.getElementById("analysis-type");
  macdHeader.innerText = "MACD";
  getStockMACD();
  const analysisChart = document.getElementById("analysis-chart");
  (async () => {
    const queryString = window.location.search;
    const index = queryString.indexOf("=");
    const stockId = queryString.slice(index + 1);
    const response = await fetch(`/api/stock/${stockId}/macd`);
    const { date, DIF, MACD, OSC } = await response.json();

    // 把上一個chart刪除
    const preAnalysisChart = Chart.getChart("analysis-chart");
    if (preAnalysisChart) preAnalysisChart.destroy();
    // 重新畫
    new Chart(analysisChart, {
      type: "line",
      data: {
        labels: date,
        datasets: [
          {
            type: "line",
            backgroundColor: "red",
            borderColor: "red",
            label: "DIF",
            data: DIF,
          },
          {
            type: "line",
            backgroundColor: "green",
            borderColor: "green",
            label: "MACD",
            data: MACD,
          },
          {
            type: "bar",
            fill: true,
            backgroundColor: "#0d877b",
            label: "OSC",
            data: OSC,
          },
        ],
      },
    });
  })();
});
