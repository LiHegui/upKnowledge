// 1
// var a = 10
// function foo(){
//     console.log(a)
// }

// function sum() {
//     var a = 20
//     foo()
// }

// sum()


// 2
var n = 10
function fn(){
    var n =20
    function f() {
       n++;
       console.log(n)
     }
    f()
    return f
}

var x = fn()
x()
x()
console.log(n)

var a = 0
function foo(){
    var b =14
    function fo(){
        console.log(a, b)
    }
    fo()
}
foo()
// 
var n = '林一一';
(function p(){
    console.log(n)
})()

var data = [];

for (var i = 0; i < 3; i++) {
  data[i] = function () {
    console.log(i);
  };
}
