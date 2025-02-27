// 无重复字符的最长子串
/**
 * @param {string} s
 * @return {number}
 */
var lengthOfLongestSubstring = function (s) {
  let left = 0; // 滑动窗口的左边界
  let maxLength = 0; // 存储最长子串长度的变量
  let charSet = new Set(); // 用于存储当前窗口中的字符

  for (let right = 0; right < s.length; right++) {
    // 当发现重复字符时，缩小窗口直到重复字符被移除
    while (charSet.has(s[right])) {
      charSet.delete(s[left]);
      left++;
    }

    // 将当前字符添加到集合中
    charSet.add(s[right]);
    // 更新最长子串长度
    maxLength = Math.max(maxLength, right - left + 1);
  }

  return maxLength;
};
console.log(lengthOfLongestSubstring("pwwkew"));
