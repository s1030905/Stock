// 監聽 "boolean-path-form" 的點擊事件
const bpFormBtn = document.querySelector("#boolean-path-form");

const getStockBP = async () => {
  // 移除原先的列表
  const table = document.querySelector("table");
  table.remove();
  // 取得stockId
  const queryString = window.location.search;
  const stockIdIndex = queryString.indexOf("=");
  const stockId = queryString.slice(stockIdIndex + 1, queryString.length);

  // 發送 API 請求
  const response = await fetch(`/api/stock/${stockId}/boolean-path`);
  const { date, ma20, ma20Top, ma20Bottom, note } = await response.json();
  // 表格訊息
  let BPList = ``;
  let [buyPrice, sellPrice, profit] = [0, 0, 0];
  let totalProfit = 0;
  for (let i = 0; i < date.length; i++) {
    const tradeSign = note[i].slice(0, 2);

    if (tradeSign === "突破") {
      buyPrice = close[i];
    } else if (tradeSign === "跌破" && buyPrice > 0) {
      sellPrice = close[i];
      profit = (sellPrice - buyPrice).toFixed(2);
      [buyPrice, sellPrice] = [0, 0];
    }
    if (profit !== 0) {
      BPList += `
      <tr>
        <th scope="row">${i + 1}</th>
        <td>${date[i]}</td>
        <td>${note[i]} 預估獲利: ${profit}</td>
      </tr>`;
      totalProfit += Number(profit);
      profit = 0;
    } else {
      BPList += `
      <tr>
        <th scope="row">${i + 1}</th>
        <td>${date[i]}</td>
        <td>${note[i]}</td>
      </tr>`;
    }
  }
  // 計算kd 總獲利
  const total = document.querySelector("#total");
  total.innerHTML = `<h4 style="font-weight: 700">Boolean Path策略共獲利: ${totalProfit.toFixed(
    2
  )}點</h4>`;
  // 更新table
  const bpContainer = document.querySelector("#table-container");
  bpContainer.innerHTML = `<table class="table">
  <thead>
    <tr>
      <th scope="col">#</th>
      <th scope="col">時間</th>
      <th scope="col">買賣訊號</th>
    </tr>
  </thead>
  <tbody>
    ${BPList}
  </tbody>
</table>`;
};
const drawBPChart = () => {
  // 把上一個chart刪除
  const preAnalysisChart = Chart.getChart("analysis-chart");
  if (preAnalysisChart) preAnalysisChart.destroy();
  // 畫圖區域
  const newChart = document.querySelector("#analysis");
  newChart.innerHTML = `<h4 class="m-2" id="analysis-type"></h4>
    <canvas id="analysis-chart" width="800" height="200"></canvas>`;

  // 選取位置 圖表名稱
  const analysisChart = document.getElementById("analysis-chart");
  const BPHeader = document.getElementById("analysis-type");

  // 畫chart
  (async () => {
    BPHeader.innerText = "Boolean Path";
    const queryString = window.location.search;
    const index = queryString.indexOf("=");
    const stockId = queryString.slice(index + 1);
    const response = await fetch(`/api/stock/${stockId}/boolean-path`);
    const { date, ma20, ma20Top, ma20Bottom, close } = await response.json();

    // 重新畫
    new Chart(analysisChart, {
      type: "line",
      data: {
        labels: date,
        datasets: [
          {
            type: "line",
            backgroundColor: "black",
            borderColor: "black",
            label: "中軌",
            data: ma20,
          },
          {
            type: "line",
            backgroundColor: "black",
            borderColor: "black",
            label: "上軌",
            data: ma20Top,
          },
          {
            type: "line",
            backgroundColor: "black",
            borderColor: "black",
            label: "下軌",
            data: ma20Bottom,
          },
          {
            type: "line",
            backgroundColor: "blue",
            borderColor: "blue",
            label: "價格",
            data: close,
          },
        ],
      },
    });
  })();
};

bpFormBtn.addEventListener("click", (event) => {
  // 取消其他標籤的 active 狀態
  const activeTabs = document.querySelectorAll(".nav-item .nav-link.active");
  activeTabs.forEach((tab) => {
    tab.classList.remove("active");
  });
  event.target.classList.add("active");
  // 表格
  getStockBP();
  // 畫圖
  drawBPChart();
});
