// const data = ["B3", "D2", "F1", "A9", "D12", "A2", "C1", "Z0", "B1"];

// data.sort((a, b) => {
//   const numA = parseInt(a.slice(1)); // 提取数据序号并转为数字
//   const numB = parseInt(b.slice(1));

//   if (numA === numB) {
//     // 如果数据序号相同，按照数据类型排序
//     const typeA = a.charCodeAt(0); // 获取数据类型的ASCII码
//     const typeB = b.charCodeAt(0);

//     return typeA - typeB;
//   }

//   return numA - numB; // 按照数据序号排序
// });

// console.log(data);

// const data = ["B3", "D2", "F1", "A9", "D12", "A2", "C1", "Z0", "B1"];

// data.sort(function (a, b) {
//     const aType = a.charAt(0);
//     const bType = b.charAt(0);
//     const aNum = Number(a.substring(1));
//     const bNum = Number(b.substring(1));

//     if (aNum === bNum) {
//         if (aType < bType) return 1;
//         if (aType > bType) return -1;
//         return 0;
//     }
//     return aNum - bNum;
// });

// console.log(data);


// var name = "a"
// (
//     function (){
//         var name
//         console.log(name);
//     }
// )()


// var arr = [2,1,3,5,9]
// var count = 0;
// arr.forEach( (val1, val2)=>{
// count++

// if (count % 3 == 0){
// return;
// }
// console.log(val);
// })

// var x = new Boolean(false)
// if (x) {
//     console.log(x);
// }


// var f = function g(){
//     return 23
// }
// console.log(typeof g());


// if(!"a" in window){
//    var a = 1
// }
// console.log(a);