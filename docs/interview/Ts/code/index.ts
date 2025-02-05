// function getProperty<T, K extends keyof T>(obj: T, key: K) {
//     return obj[key];
// }
// let person = { name: 'tom', age: 0 }
// console.log(typeof getProperty(person, 'name'));


namespace name1 {
    let a1: boolean = true

    let a2: [number] = [1]

    let a3: [string, number] = ['1', 2]

    enum A4 {
        top = 1,
        left,
        bottom,
        right
    }

    let a5: A4 = A4.top

    let a6: () => void = function () {
        console.log('无返回值');
    }
    console.log(A4.right);

    interface Person {
        name: string,
        gender: number,
        money?: number,
        [protype: string]: any
    }
    type Person2 = {
        name: string,
        gender: number,
        money?: number,
        [protype: string]: any
    }
    let per1: Person = {
        name: '1',
        gender: 0,
        ceshi: 1
    }

    let per2: Person2 = {
        name: '1',
        gender: 0,
        ceshi: 1
    }

    interface newPerson {
        name: string,
        gender: number,
        money?: number,
        [protype: string]: any,
        output: () => void
    }
    interface newPerson2 {
        name: string,
        gender: number,
        money?: number,
        [protype: string]: any,
        output: () => void
    }

    interface newPerson3 extends newPerson2 {

    }

    class Person3 implements newPerson, newPerson2 {
        [protype: string]: any
        name: string
        gender: number
        money?: number | undefined
        output: () => void
    }
    
}

