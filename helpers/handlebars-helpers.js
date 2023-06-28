const date = new Date();

module.exports = {
  currentYear: date.getFullYear(),
  addIndex: (index) => {
    return index + 1;
  },
};
