import{_ as a,o as l,c as e,e as i}from"./app-DHLwyd6l.js";const n={},t=i('<h1 id="说说javascript中的数据类型-存储上的差别" tabindex="-1"><a class="header-anchor" href="#说说javascript中的数据类型-存储上的差别"><span>说说JavaScript中的数据类型？存储上的差别？</span></a></h1><ul><li>基本类型 <ul><li>number</li><li>boolean</li><li>undefined</li><li>string</li><li>null</li><li>NAN</li><li>symbol symbol是原始值，且符号实例是唯一的、不可变的。符号的确定是确保对象属性使用唯一表示符，不会发生属性冲突的危险。</li></ul></li><li>复杂类型 <ul><li>Object</li><li>Array</li><li>Function</li></ul></li></ul><h2 id="判断类型" tabindex="-1"><a class="header-anchor" href="#判断类型"><span>判断类型</span></a></h2><h2 id="堆栈的区别" tabindex="-1"><a class="header-anchor" href="#堆栈的区别"><span>堆栈的区别</span></a></h2><h1 id="null和undefine的区别" tabindex="-1"><a class="header-anchor" href="#null和undefine的区别"><span>null和undefine的区别</span></a></h1><p>null 和 undefined 都表示空值 null 表示一个被明确赋值为 null 的变量或对象属性。null 常用于表示一个不存在的对象，或者将一个对象的值空 undefined 表示一个声明了但未被赋值的变量，或者访问一个不存在的属性或数组元素时返回的值 二者都存在于栈内存</p><h1 id="let-const-var" tabindex="-1"><a class="header-anchor" href="#let-const-var"><span>let const var</span></a></h1><p>var 表示定义变量 为函数作用域，存在变量提升 let 表示定义变量，为块级作用域 const 表示为常量，表示不允许更改，其实只要不改变值的地址就可以了，可以改变对象的属性。块级作用域变量。</p><h2 id="作用域" tabindex="-1"><a class="header-anchor" href="#作用域"><span>作用域</span></a></h2><p>作用域分为块级作用域、函数作用域、还有全局作用域</p><ul><li>块级作用域 为{}包含起来的就是块级作用域for循环，if判断等等</li><li>函数作用域 函数内部存在的作用域，var声明的都是函数作用域，函数执行结束，不存在引用的话（闭包），就会把函数内部的变量进行回收。</li><li>全局作用域 是指在函数外部定义的，全局可以访问到的，浏览器中指的是window，Node中指的是gobal对象</li></ul><h3 id="作用域链" tabindex="-1"><a class="header-anchor" href="#作用域链"><span>作用域链</span></a></h3><h1 id="谈谈-javascript-中的类型转换机制" tabindex="-1"><a class="header-anchor" href="#谈谈-javascript-中的类型转换机制"><span>谈谈 JavaScript 中的类型转换机制</span></a></h1><ul><li>显示转换</li><li>隐式转换</li></ul><h1 id="typeof-与-instanceof-区别" tabindex="-1"><a class="header-anchor" href="#typeof-与-instanceof-区别"><span>typeof 与 instanceof 区别</span></a></h1><ul><li>typeof 只能识别简单类型，引用类型都会判定为object</li><li>instanceof 可以判断一个对象是否是某个类的实例，只能判断引用类型，不能判断基本类型。 最好的方案是Object.prototype.toString.call()，用于精准的判断变量的类型，还是需要剪切一下。 当然，还有一些API,比如数组的isArray(),isNaN方法</li></ul>',16),s=[t];function r(c,o){return l(),e("div",null,s)}const d=a(n,[["render",r],["__file","index.html.vue"]]),p=JSON.parse('{"path":"/tools/docs/interview/JavaScript/%E5%8F%98%E9%87%8F/","title":"说说JavaScript中的数据类型？存储上的差别？","lang":"zh-CN","frontmatter":{},"headers":[{"level":2,"title":"判断类型","slug":"判断类型","link":"#判断类型","children":[]},{"level":2,"title":"堆栈的区别","slug":"堆栈的区别","link":"#堆栈的区别","children":[]},{"level":2,"title":"作用域","slug":"作用域","link":"#作用域","children":[{"level":3,"title":"作用域链","slug":"作用域链","link":"#作用域链","children":[]}]}],"git":{},"filePathRelative":"tools/docs/interview/JavaScript/变量/index.md"}');export{d as comp,p as data};