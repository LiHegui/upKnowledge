// 冒泡排序
function bubbleSort(arr) {
  let len = arr.length;
  for (let i = 0; i < len; i++) {
    for (let j = i + 1; j < len; j++) {
      if (arr[i] > arr[j]) {
        let temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
      }
    }
  }
}
console.log('====================================');
let arr = [1, 3, 2, 5, 4, 6, 7, 8, 9, 0];
bubbleSort(arr)
console.log('====================================');
console.log(arr);
console.log('====================================');
console.log('====================================');