const rsiChart = document.getElementById("rsi-chart");
(async () => {
  const queryString = window.location.search;
  const index = queryString.indexOf("=");
  const stockId = queryString.slice(index + 1);
  const response = await fetch(`/api/stock/${stockId}/rsi`);
  const { date, RSI5, RSI10 } = await response.json();

  new Chart(rsiChart, {
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
