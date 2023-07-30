const ctx = document.getElementById("myChart");
(async () => {
  const queryString = window.location.search;
  const index = queryString.indexOf("=");
  const stockId = queryString.slice(index + 1);
  const response = await fetch(`/api/stock/${stockId}`);
  const records = await response.json();
  const { highLow, date, color, openEnd, max, min, volumeRelative } = records;
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
          barPercentage: 100,
          categoryPercentage: 0.01,
        },

        {
          type: "bar",
          backgroundColor: "black",
          borderColor: "black",
          label: "高低價",
          data: highLow,
          barPercentage: 20,
          categoryPercentage: 0.01,
        },
        {
          type: "bar",
          fill: true, // 填滿線圖面積
          backgroundColor: "#0d877b",
          label: "成交量",
          data: volumeRelative,
          barPercentage: 200,
          categoryPercentage: 0.01,
          yAxisID: "y2", // 使用新的 y 軸
        },
      ],
    },
    options: {
      scales: {
        y: {
          min,
          max,
          title: {
            display: true,
            text: "股價",
            font: {
              size: 14,
              weight: "normal",
            },
          },
        },
        y2: {
          type: "linear",
          position: "right",
          min: 0,
          max: 200,
          grid: {
            drawOnChartArea: false, // 避免新的 y 軸繪製在原先的圖表上
          },
          title: {
            display: true,
            text: "相對平均成交量",
            font: {
              size: 14,
              weight: "normal",
            },
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
