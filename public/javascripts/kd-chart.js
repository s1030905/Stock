const kdChart = document.getElementById("analysis-chart");
const kdHeader = document.getElementById("analysis-type");
(async () => {
  kdHeader.innerText = "KD";
  const queryString = window.location.search;
  const index = queryString.indexOf("=");
  const stockId = queryString.slice(index + 1);
  const response = await fetch(`/api/stock/${stockId}/kd`);
  const { date, k, d } = await response.json();

  new Chart(kdChart, {
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
