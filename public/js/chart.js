const ctx = document.getElementById("myChart");

var myChart = new Chart(ctx, {
  type: "bar",
  data: {
    labels: { date },
    datasets: [
      {
        type: "bar",
        backgroundColor: ["rgba(54, 162, 235, 0.2)"],
        borderColor: ["rgba(54, 162, 235, 1)"],
        borderWidth: 0.5,
        label: "銷售業績(百萬)",
        data: [
          [50, 60],
          [49, 55],
          [63, 72],
        ],
      },
      {
        type: "scatter",
        label: "新開發客戶",
        data: [
          { x: "一月", y: 40 },
          { x: "一月", y: 70 },
          { x: "二月", y: 39 },
          { x: "二月", y: 65 },
          { x: "三月", y: 53 },
          { x: "三月", y: 82 },
        ],
      },
    ],
  },
});
