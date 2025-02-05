let arr = [10, 2, 8, 51, 34, 32, 56, 78]
/**
 * 冒泡排序-正序
 * @param {*} arr
 * @returns
 */
function BubbleSort(arr) {
    const { length } = arr
    let tempArr = arr
    for (let i = 0; i < length; i++) {
        for (let j = i + 1; j < length; j++) {
            if (arr[i] > arr[j]) {
                let temp = arr[i]
                arr[i] = arr[j]
                arr[j] = temp
            }
        }
    }
    return tempArr
}


/**
 * 选择排序
 * @param {*} arr
 * @returns
 */
function selectSort(arr) {
    const { length } = arr
    let tempArr = arr
    for (var i = 0; i < length; i++) {
        let tempIndex = i
        let tempValue = arr[i]
        for (var j = i + 1; j < length; j++) {
            if (tempValue > arr[j]) {
                tempIndex = j
                tempValue = arr[j]
            }
        }
        let temp = arr[tempIndex]
        arr[tempIndex] = arr[i]
        arr[i] = temp
    }
    return tempArr
}

/**
 * 快排
 * @param {*} arr 数组
 * @param {*} s 开始位置
 * @param {*} e 结束位置
 * @returns
 */
function QuickSort(arr, s, e) {
    if (s >= e) return
    let basicValue = arr[s]
    let swapIndex = s
    for (let i = s + 1; i <= e; i++) {
        if (arr[i] < basicValue) {
            // 交换
            swapIndex++
            let temp = arr[i]
            arr[i] = arr[swapIndex]
            arr[swapIndex] = temp
        }
    }
    let temp = arr[swapIndex]
    arr[swapIndex] = arr[s]
    arr[s] = temp
    QuickSort(arr, s, swapIndex - 1)
    QuickSort(arr, swapIndex + 1, e)
}

QuickSort(arr, 0, arr.length - 1)
console.log(arr)
