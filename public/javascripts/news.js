// 監聽 "News" 的點擊事件
const newsBtn = document.querySelector("#news");

const getStockNews = async () => {
  // 移除原先的列表
  const table = document.querySelector("table");
  table.remove();
  // 取得stockId
  const queryString = window.location.search;
  const stockId = queryString.slice(-4);

  // 發送 API 請求
  const response = await fetch(`/api/stock/${stockId}/news`);
  const data = await response.json();

  // 解析資料，生成新聞列表的 HTML 內容
  let newsList = ``;
  let index = 1;
  for (let i of data) {
    newsList += `
      <tr>
        <th scope="row">${index}</th>
        <td><a href=${i["link"]}>${i["title"]}</a></td>
        <td>${i["date"]}</td>
      </tr>`;
    index++;
  }

  // 將新聞列表插入到網頁中的某個容器元素中
  const newsContainer = document.querySelector("#table-container");
  newsContainer.innerHTML = `<table class="table">
  <thead>
    <tr>
      <th scope="col">#</th>
      <th scope="col">標題</th>
      <th scope="col">時間</th>
    </tr>
  </thead>
  <tbody>
    ${newsList}
  </tbody>
</table>`;
};

newsBtn.addEventListener("click", (event) => {
  // 取消其他標籤的 active 狀態
  const activeTabs = document.querySelectorAll(".nav-item .nav-link.active");
  activeTabs.forEach((tab) => {
    tab.classList.remove("active");
  });

  event.target.classList.add("active");
  getStockNews();
});
