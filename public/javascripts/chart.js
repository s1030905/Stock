const ctx = document.getElementById("myChart");
(async () => {
  const response = await fetch("/api/chatData");
  const records = await response.json();
  const { highLow, date, color, openEnd, max, min } = records;
  const [red, green, black] = ["red", "green", "black"];
  const formedOpenEnd = [];
  openEnd.forEach((element) => {
    if (element[0] === element[1]) {
      formedOpenEnd.push([element[0], element[1] + 0.1]);
    } else {
      formedOpenEnd.push([element[0], element[1]]);
    }
  });
  console.log(highLow);
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
          data: formedOpenEnd,
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
          min: Math.ceil(min / 10) * 10 - 10, // y 軸的最小值
          max: Math.floor(max / 10) * 10 + 10, // y 軸的最大值
        },
      },
    },
  });
})();
