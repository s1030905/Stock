// 監聽 "kd-form" 的點擊事件
const kdFormBtn = document.querySelector("#kd-form");
// const priceFormBtn = document.querySelector("#price");

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
      kdList += `
      <tr>
        <th scope="row">${i + 1}</th>
        <td>${date[i]}</td>
        <td>${k[i]}</td>
        <td>${d[i]}</td>
        <td>${diff[i]}</td>
        <td>${note[i]} 預估獲利: ${profit}</td>
      </tr>`;
      totalProfit += Number(profit);
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
  // 計算kd 總獲利
  const total = document.querySelector("#total");
  total.innerHTML = `<h4 style="font-weight: 700">KD策略共獲利: ${totalProfit.toFixed(
    2
  )}點</h4>`;
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
const drawKDChart = () => {
  // 把上一個chart刪除
  const preAnalysisChart = Chart.getChart("analysis-chart");
  if (preAnalysisChart) preAnalysisChart.destroy();
  // 畫圖區域
  const newChart = document.querySelector("#analysis");
  newChart.innerHTML = `<h4 class="m-2" id="analysis-type"></h4>
    <canvas id="analysis-chart" width="800" height="200"></canvas>`;

  // 選取位置 圖表名稱
  const analysisChart = document.getElementById("analysis-chart");
  const kdHeader = document.getElementById("analysis-type");
  // 畫chart
  (async () => {
    kdHeader.innerText = "KD";
    const queryString = window.location.search;
    const index = queryString.indexOf("=");
    const stockId = queryString.slice(index + 1);
    const response = await fetch(`/api/stock/${stockId}/kd`);
    const { date, k, d } = await response.json();

    // 圖表設定
    new Chart(analysisChart, {
      type: "line",
      data: {
        labels: date,
        datasets: [
          {
            type: "line",
            backgroundColor: "red",
            borderColor: "red",
            label: "K",
            data: k,
          },
          {
            type: "line",
            backgroundColor: "green",
            borderColor: "green",
            label: "D",
            data: d,
          },
        ],
      },
      options: {
        scales: {
          y: {
            min: 0,
            max: 100,
          },
        },
      },
    });
  })();
};

kdFormBtn.addEventListener("click", (event) => {
  // 取消其他標籤的 active 狀態
  const activeTabs = document.querySelectorAll(".nav-item .nav-link.active");
  activeTabs.forEach((tab) => {
    tab.classList.remove("active");
  });
  event.target.classList.add("active");
  // 表格
  getStockKD();
  // 畫圖
  drawKDChart();
});

// priceFormBtn.addEventListener("click", (event) => {
//   // 取消其他標籤的 active 狀態
//   const activeTabs = document.querySelectorAll(".nav-item .nav-link.active");
//   activeTabs.forEach((tab) => {
//     tab.classList.remove("active");
//   });
//   event.target.classList.add("active");
//   // 表格
//   getStockKD();
//   // 畫圖
//   drawKDChart();
// });
