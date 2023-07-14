const date = new Date();

module.exports = {
  currentYear: date.getFullYear(),
  addIndex: (index) => {
    return index + 1;
  },
  ifCondition: function (number, tar) {
    const percentage = Number(number).toFixed(2);
    const redHTML = `<td style="color: red; font-weight:bolder">${percentage}%</td>`;
    const normalHTML = `<td>${percentage}%</td>`;
    return Math.abs(percentage) > 2 ? redHTML : normalHTML;
  },
};
