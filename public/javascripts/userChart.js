const ctx = document.getElementById("container");
(async () => {
  const userStockResponse = await fetch(`/api/stock/userStock`);
  const { compare, date, stockId, stockName } = await userStockResponse.json();
  const colors = ["blue", "#36A2EB", "red", "#ebda36", "black", "#13c1b1"]; // 顏色陣列，可根據需要擴充
  const datasets = [];
  for (let i = 0; i < stockId.length; i++) {
    if (stockId[i] === "0050") {
      datasets.push({
        type: "line",
        backgroundColor: colors[i % colors.length], // 使用餘數來循環選擇顏色
        borderColor: colors[i % colors.length],
        borderWidth: 3,
        label: `${stockId[i]}  ${stockName[i]}`,
        data: compare[i],
      });
    } else {
      datasets.push({
        type: "line",
        backgroundColor: colors[i % colors.length], // 使用餘數來循環選擇顏色
        borderColor: colors[i % colors.length],
        borderWidth: 1.5,
        label: `${stockId[i]}  ${stockName[i]}`,
        data: compare[i],
      });
    }
  }
  const myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: date,
      datasets: datasets,
    },
    options: {
      scales: {
        x: {
          title: {
            display: true,
            text: "日期",
            font: {
              size: 14,
              weight: "bold",
            },
          },
        },
        y: {
          title: {
            display: true,
            text: "%",
            font: {
              size: 14,
              weight: "bold",
            },
          },
        },
      },
    },
  });
})();
