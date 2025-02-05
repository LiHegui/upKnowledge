// 二分查找
let arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

function check(arr, s, e, target) {
    if (s > e) return -1
    let mid = Math.floor((s + e) / 2)
    let midValue = arr[mid]
    if (midValue == target) return mid
    if (midValue < target) {
        return check(arr, mid + 1, e, target)
    } else {
        return check(arr, s, mid - 1, target)
    }
}
// 升级玩法
let arr1 = [1, 2, 3, 4, 5, 6, 7, 8, 8, 8, 8, 9]


