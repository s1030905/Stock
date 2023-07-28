const ctx = document.getElementById("myChart");
(async () => {
  const queryString = window.location.search;
  const index = queryString.indexOf("=");
  const stockId = queryString.slice(index + 1);
  const response = await fetch(`/api/stock/${stockId}`);
  const records = await response.json();
  const { highLow, date, color, openEnd, max, min, k, d } = records;
  const [red, green, black] = ["red", "green", "black"];
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: date,
      datasets: [
        {
          type: "bar",
          backgroundColor: color,
          borderColor: color,
          borderWidth: 1,
          label: "開收價",
          data: openEnd,
          barPercentage: 10,
          categoryPercentage: -0.1,
        },
        {
          type: "bar",
          backgroundColor: "black",
          borderColor: "black",
          label: "高低價",
          data: highLow,
          barPercentage: 0.5,
          categoryPercentage: 0.1,
        },
        {
          type: "line",
          fill: false, // 填滿線圖面積
          borderColor: "red", // 設定線的顏色
          label: "K",
          data: k,
          yAxisID: "y2", // 使用新的 y 軸
        },
        {
          type: "line",
          fill: false, // 填滿線圖面積
          borderColor: "green", // 設定線的顏色
          label: "D",
          data: d,
          yAxisID: "y2", // 使用新的 y 軸
        },
      ],
    },
    options: {
      scales: {
        y: {
          min,
          max,
        },
        y2: {
          type: "linear",
          position: "right",
          min: 0,
          max: 100,
          grid: {
            drawOnChartArea: false, // 避免新的 y 軸繪製在原先的圖表上
          },
        },
      },
    },
    plugins: {
      annotation: {
        annotations: [
          {
            type: "line",
            mode: "horizontal",
            scaleID: "y2", // 使用新的 y 軸
            value: 10, // 新的 y 軸的標記位置
            borderColor: "red", // 標記的顏色
            borderWidth: 2, // 標記的寬度
            label: {
              content: "y2", // 標記的標籤文字
              enabled: true, // 是否顯示標籤
              position: "right", // 標籤顯示在右側
            },
          },
        ],
      },
    },
  });
})();
