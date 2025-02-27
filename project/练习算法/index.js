// 给定一个含有 n 个正整数的数组和一个正整数 target 。
// 找出该数组中满足其总和大于等于 target 的长度最小的
// 子数组
//  [numsl, numsl+1, ..., numsr-1, numsr] ，并返回其长度。如果不存在符合条件的子数组，返回 0 。
/**
 * @param {number} target
 * @param {number[]} nums
 * @return {number}
 */
var minSubArrayLen = function (target, nums) {
  let left = 0; // 滑动窗口的左边界
  let sum = 0; // 当前窗口的总和
  let minLen = Infinity; // 存储最小长度的变量，初始设为无穷大

  // 遍历数组，right 是滑动窗口的右边界
  for (let right = 0; right < nums.length; right++) {
    sum += nums[right]; // 将当前元素加到窗口的总和中

    // 当总和大于等于 target 时，尝试缩小窗口
    while (sum >= target) {
      // 更新最小长度
      minLen = Math.min(minLen, right - left + 1);
      // 减去窗口左边的元素，并移动左边界
      sum -= nums[left];
      left++;
    }
  }

  // 如果 minLen 没有被更新，说明没有找到符合条件的子数组
  return minLen === Infinity ? 0 : minLen;
};

console.log(minSubArrayLen(7, [2, 3, 1, 2, 4, 3]));
