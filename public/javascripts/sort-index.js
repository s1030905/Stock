// 監聽 "col" 的點擊事件
const btn = document.querySelector("#col");
btn.addEventListener("click", async (event) => {
  const response = await fetch(`/api/stock/index`);
  const result = await response.json();
  if (event.target.id === "fluctuations") {
    let data = result["data"].sort((a, b) => {
      return (
        Number(a["漲跌"] + a["漲跌點數"]) - Number(b["漲跌"] + b["漲跌點數"])
      );
    });
    display(data);
  }
  if (event.target.id === "fluctuations-percent") {
    let data = result["data"].sort((a, b) => {
      return Number(a["漲跌百分比"]) - Number(b["漲跌百分比"]);
    });
    display(data);
  }
  if (event.target.id === "index-close") {
    let data = result["data"].sort((a, b) => {
      return Number(a["收盤指數"]) - Number(b["收盤指數"]);
    });
    display(data);
  }
});
const display = (data) => {
  const tableContainer = document.querySelector("#table-body");
  tableContainer.innerHTML = ``;
  for (let i = 0; i < data.length; i++) {
    if (Math.abs(Number(data[i]["漲跌百分比"])) >= 2) {
      tableContainer.innerHTML += `
      <tr>
        <th scope="row">${i + 1}</th>
        <td>${data[i]["指數"]}</td>
        <td>${data[i]["收盤指數"]}</td>
        <td>${data[i]["漲跌"]} ${data[i]["漲跌點數"]}</td>
        <td style="color: red;">${data[i]["漲跌百分比"]} %</td>
      </tr>`;
    } else {
      tableContainer.innerHTML += `
      <tr>
        <th scope="row">${i + 1}</th>
        <td>${data[i]["指數"]}</td>
        <td>${data[i]["收盤指數"]}</td>
        <td>${data[i]["漲跌"]} ${data[i]["漲跌點數"]}</td>
        <td>${data[i]["漲跌百分比"]}</td>
      </tr>`;
    }
  }
};
// {{#ifCondition this.漲跌百分比}}{{/ifCondition}}
