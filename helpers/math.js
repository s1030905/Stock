const sd = (nums, n) => {
  const avg = nums.reduce((a, b) => a + b, 0) / n;
  let sum = 0;
  for (const i of nums) {
    sum += (i - avg) ** 2;
  }
  sum = Math.sqrt(sum / n);
  return sum;
};
module.exports = { sd };
