// 監聽 "rsi-form" 的點擊事件
const rsiFormBtn = document.querySelector("#rsi-form");

const getStockRSI = async () => {
  // 移除原先的列表
  const table = document.querySelector("table");
  table.remove();
  // 取得stockId
  const queryString = window.location.search;
  const stockIdIndex = queryString.indexOf("=");
  const stockId = queryString.slice(stockIdIndex + 1, queryString.length);

  // 發送 API 請求
  const response = await fetch(`/api/stock/${stockId}/rsi`);
  const { date, RSI5, RSI10, close, note } = await response.json();
  const RSI5Format = RSI5.map((e) => {
    if (e == null) {
      return "--";
    } else {
      return e;
    }
  });
  const RSI10Format = RSI10.map((e) => {
    if (e == null) {
      return "--";
    } else {
      return e;
    }
  });
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
        <td>${RSI5[i]}</td>
        <td>${RSI10[i]}</td>
        <td>${note[i]} 預估獲利: ${profit}</td>
      </tr>`;
      totalProfit += Number(profit);
      profit = 0;
    } else {
      rsiList += `
      <tr>
        <th scope="row">${i + 1}</th>
        <td>${date[i]}</td>
        <td>${RSI5Format[i]}</td>
        <td>${RSI10Format[i]}</td>
        <td>${note[i]}</td>
      </tr>`;
    }
  }
  // 計算rsi 總獲利
  const total = document.querySelector("#total");
  total.innerHTML = `<h4 style="font-weight: 700">RSI策略共獲利: ${totalProfit.toFixed(
    2
  )}點</h4>`;
  // 更新table
  const kdContainer = document.querySelector("#table-container");
  kdContainer.innerHTML = `<table class="table">
  <thead>
    <tr>
      <th scope="col">#</th>
      <th scope="col">時間</th>
      <th scope="col">RSI5</th>
      <th scope="col">RSI10</th>
      <th scope="col">買賣訊號</th>
    </tr>
  </thead>
  <tbody>
    ${rsiList}
  </tbody>
</table>`;
};

rsiFormBtn.addEventListener("click", (event) => {
  // 取消其他標籤的 active 狀態
  const activeTabs = document.querySelectorAll(".nav-item .nav-link.active");
  activeTabs.forEach((tab) => {
    tab.classList.remove("active");
  });
  event.target.classList.add("active");
  getStockRSI();

  // 把上一個chart刪除
  const preAnalysisChart = Chart.getChart("analysis-chart");
  if (preAnalysisChart) preAnalysisChart.destroy();
  // 畫圖區域
  const newChart = document.querySelector("#analysis");
  newChart.innerHTML = `<h4 class="m-2" id="analysis-type"></h4>
    <canvas id="analysis-chart" width="800" height="200"></canvas>`;

  // 選取位置 圖表名稱
  const analysisChart = document.getElementById("analysis-chart");
  const rsiHeader = document.getElementById("analysis-type");
  rsiHeader.innerText = "RSI";
  // 圖表
  (async () => {
    const queryString = window.location.search;
    const index = queryString.indexOf("=");
    const stockId = queryString.slice(index + 1);
    const response = await fetch(`/api/stock/${stockId}/rsi`);
    const { date, RSI5, RSI10 } = await response.json();

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
            label: "RSI5",
            data: RSI5,
          },
          {
            type: "line",
            backgroundColor: "green",
            borderColor: "green",
            label: "RSI10",
            data: RSI10,
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
});
