const explanationBtn = document.querySelector("#explanationBtn");
explanationBtn.addEventListener("mouseenter", (event) => {
  const explanationContainer = document.querySelector("#explanationContainer");
  explanationContainer.innerHTML = `<div class="alert alert-danger alert-dismissible fade show" role="alert">
    黃金交叉為買點；死亡交叉為買點
    <button
      type="button"
      class="btn-close"
      data-bs-dismiss="alert"
      aria-label="Close"
    ></button>
  </div>`;
});
