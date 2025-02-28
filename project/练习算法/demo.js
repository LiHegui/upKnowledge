function merge(intervals) {
    if (intervals.length === 0) return [];

    // 按区间的起始点排序
    intervals.sort((a, b) => a[0] - b[0]);

    let result = [intervals[0]]; // 初始化结果数组

    for (let i = 1; i < intervals.length; i++) {
        let last = result[result.length - 1]; // 结果数组的最后一个区间
        let current = intervals[i]; // 当前区间

        // 检查是否重叠
        if (current[0] <= last[1]) {
            // 合并区间，更新结束点
            last[1] = Math.max(last[1], current[1]);
        } else {
            // 不重叠，直接加入结果数组
            result.push(current);
        }
    }

    return result;
}

// 测试
let intervals = [[1, 3], [2, 6], [8, 10], [15, 18]];
console.log(merge(intervals)); // 输出: [[1, 6], [8, 10], [15, 18]]