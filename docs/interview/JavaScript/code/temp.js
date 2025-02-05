function* generator(data) {
    const first = yield data
  
    const second = yield first
  
    const third = yield second
  
    yield third
  }
  
  const gen = generator(10)
  
  console.log('1', gen.next()); // 1 { value: 10, done: false }
  console.log('2', gen.next(20)); // 2 { value: 20, done: false }
  console.log('3', gen.next("moyuanjun")); // 3 { value: 'moyuanjun', done: false }
  console.log('4', gen.next({ age: 18 })); //4 { value: { age: 18 }, done: false }
  console.log('5', gen.next(0)); // 5 { value: undefined, done: true }  