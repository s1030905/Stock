const ctx = document.getElementById("myChart");
(async () => {
  const queryString = window.location.search;
  const index = queryString.indexOf("=");
  const stockId = queryString.slice(index + 1);
  const response = await fetch(`/api/stock/${stockId}`);
  const records = await response.json();
  const { highLow, date, color, openEnd, max, min } = records;
  const [red, green, black] = ["red", "green", "black"];
  const myChart = new Chart(ctx, {
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
      ],
    },
    options: {
      scales: {
        y: {
          min: Math.round(min) - (Math.round(max) - Math.round(min)), // y 軸的最小值
          max: Math.round(max) + (Math.round(max) - Math.round(min)), // y 軸的最大值
        },
      },
    },
  });
})();
