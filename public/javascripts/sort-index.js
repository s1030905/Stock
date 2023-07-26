// 監聽 "col" 的點擊事件
const btn = document.querySelector("#col");
btn.addEventListener("click", async (event) => {
  const response = await fetch(`/api/stock/index`);
  const result = await response.json();
  let data;
  // 漲跌點數排序
  if (event.target.id === "fluctuations") {
    // 選中變色
    const allBtn = document.querySelectorAll(".btn");
    for (const i of allBtn) {
      i.removeAttribute("style");
    }
    event.target.setAttribute("style", "color: blue; font-weight: bold;");

    // 由大到小
    const sortDirection = event.target.getAttribute("data-sort");
    if (sortDirection === "desc") {
      data = result["data"].sort(
        (a, b) =>
          Number(b["漲跌"] + b["漲跌點數"]) - Number(a["漲跌"] + a["漲跌點數"])
      );
      event.target.setAttribute("data-sort", "asc");
      display(data);
      // 由小到大
    } else {
      data = result["data"].sort(
        (a, b) =>
          Number(a["漲跌"] + a["漲跌點數"]) - Number(b["漲跌"] + b["漲跌點數"])
      );
      event.target.setAttribute("data-sort", "desc");
      display(data);
    }
  }

  // 漲跌百分比排序
  if (event.target.id === "fluctuations-percent") {
    // 選中變色
    const allBtn = document.querySelectorAll(".btn");
    for (const i of allBtn) {
      i.removeAttribute("style");
    }
    event.target.setAttribute("style", "color: blue; font-weight: bold;");

    // 由大到小
    const sortDirection = event.target.getAttribute("data-sort");
    if (sortDirection === "desc") {
      data = result["data"].sort(
        (a, b) => Number(a["漲跌百分比"]) - Number(b["漲跌百分比"])
      );
      event.target.setAttribute("data-sort", "asc");
      display(data);
      // 由小到大
    } else {
      data = result["data"].sort(
        (a, b) => Number(b["漲跌百分比"]) - Number(a["漲跌百分比"])
      );
      event.target.setAttribute("data-sort", "desc");
      display(data);
    }
  }

  // 收盤指數排序
  if (event.target.id === "index-close") {
    // 選中變色
    const allBtn = document.querySelectorAll(".btn");
    for (const i of allBtn) {
      i.removeAttribute("style");
    }
    event.target.setAttribute("style", "color: blue; font-weight: bold;");

    // 由大到小
    const sortDirection = event.target.getAttribute("data-sort");
    if (sortDirection === "desc") {
      data = result["data"].sort(
        (a, b) => Number(a["收盤指數"]) - Number(b["收盤指數"])
      );
      event.target.setAttribute("data-sort", "asc");
      display(data);
      // 由小到大
    } else {
      data = result["data"].sort(
        (a, b) => Number(b["收盤指數"]) - Number(a["收盤指數"])
      );
      event.target.setAttribute("data-sort", "desc");
      display(data);
    }
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
        <td>${data[i]["漲跌百分比"]} %</td>
      </tr>`;
    }
  }
};
