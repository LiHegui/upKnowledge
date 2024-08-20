# useContext
**useContext 是一个传递组件上下文的钩子，提供读取和订阅功能**

useContext是组件Provider传递context过程中的一环

>Context 可以让我们无须明确地传遍每一个组件，就能将值深入传递进组件树。

🙋 作用
- 向组件树深层传递数据
    💨参考下面的**如何使用？**
- 通过context更新传递的数据
    💨参考下面的**通过context更新传递的数据**
- 指定回退默认值
    💨
## 如何使用？
我们用一个例子说明
1. 根组件植入
```javascript
    // 我们所说的context是createContext创建的，声明了可以从组件获取
    // 或者给提供者信息，在provider中可以传递具体的值
    const ThemeContext = createContext(null);
    export default function MyApp() {
        return (
            // 我们只提供了一个dark值
            <ThemeContext.Provider value="dark">
                <Form />
            </ThemeContext.Provider>
        )
    }
```
2. 此时我们在子组件树中需要有个接受方，用来获取数据
```javascript
    function Form(){
        return(
            <>
                ...(渲染Form)
            </>
        )
    }
```
当 Form 中的任何位置的 Button 调用 useContext(ThemeContext) 时，它都将接收 "dark" 作为值

>useContext() 总是在调用它的组件 上面 寻找最近的 provider。它向上搜索， 不考虑 调用 useContext() 的组件中的 provider。

## 通过context更新传递的数据
官网上有很多例子，我就选一个进行说明

其实很容易理解，把改变state的方法一起作为context传递下去就可以了

我们在传递的同时要注意操作同一个context，我们日常在props来改变共享父级的状态，然后改变父级值，通过props再传递给自己，然后更新。

道理都是差不多，只是Provider层级较深，不用我们来进行一级一级的操作。

```javascript
import { createContext, useContext, useState } from 'react';

const CurrentUserContext = createContext(null);

export default function MyApp() {
  const [currentUser, setCurrentUser] = useState(null);
  return (
    <CurrentUserContext.Provider
      value={{
        currentUser,
        setCurrentUser
      }}
    >
      <Form />
    </CurrentUserContext.Provider>
  );
}

function Form({ children }) {
  return (
    <Panel title="Welcome">
      <LoginButton />
    </Panel>
  );
}

function LoginButton() {
  const {
    currentUser,
    setCurrentUser
  } = useContext(CurrentUserContext);

  if (currentUser !== null) {
    return <p>You logged in as {currentUser.name}.</p>;
  }

  return (
    <Button onClick={() => {
      setCurrentUser({ name: 'Advika' })
    }}>Log in as Advika</Button>
  );
}

function Panel({ title, children }) {
  return (
    <section className="panel">
      <h1>{title}</h1>
      {children}
    </section>
  )
}

function Button({ children, onClick }) {
  return (
    <button className="button" onClick={onClick}>
      {children}
    </button>
  );
}

```

由上，我们可以看出，我们似乎可以进行多个Provider传递，只需进行嵌套即可
我们来看一个官网的例子, 还是很清晰明了的，不再赘述
```javascript
import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext(null);
const CurrentUserContext = createContext(null);

export default function MyApp() {
  const [theme, setTheme] = useState('light');
  const [currentUser, setCurrentUser] = useState(null);
  return (
    <ThemeContext.Provider value={theme}>
      <CurrentUserContext.Provider
        value={{
          currentUser,
          setCurrentUser
        }}
      >
        <WelcomePanel />
        <label>
          <input
            type="checkbox"
            checked={theme === 'dark'}
            onChange={(e) => {
              setTheme(e.target.checked ? 'dark' : 'light')
            }}
          />
          Use dark mode
        </label>
      </CurrentUserContext.Provider>
    </ThemeContext.Provider>
  )
}

function WelcomePanel({ children }) {
  const {currentUser} = useContext(CurrentUserContext);
  return (
    <Panel title="Welcome">
      {currentUser !== null ?
        <Greeting /> :
        <LoginForm />
      }
    </Panel>
  );
}

function Greeting() {
  const {currentUser} = useContext(CurrentUserContext);
  return (
    <p>You logged in as {currentUser.name}.</p>
  )
}

function LoginForm() {
  const {setCurrentUser} = useContext(CurrentUserContext);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const canLogin = firstName !== '' && lastName !== '';
  return (
    <>
      <label>
        First name{': '}
        <input
          required
          value={firstName}
          onChange={e => setFirstName(e.target.value)}
        />
      </label>
      <label>
        Last name{': '}
        <input
        required
          value={lastName}
          onChange={e => setLastName(e.target.value)}
        />
      </label>
      <Button
        disabled={!canLogin}
        onClick={() => {
          setCurrentUser({
            name: firstName + ' ' + lastName
          });
        }}
      >
        Log in
      </Button>
      {!canLogin && <i>Fill in both fields.</i>}
    </>
  );
}

function Panel({ title, children }) {
  const theme = useContext(ThemeContext);
  const className = 'panel-' + theme;
  return (
    <section className={className}>
      <h1>{title}</h1>
      {children}
    </section>
  )
}

function Button({ children, disabled, onClick }) {
  const theme = useContext(ThemeContext);
  const className = 'button-' + theme;
  return (
    <button
      className={className}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```
另外还有封装Provider,这里不再多说，就是把传递的对象通过props传递给封装的组件，在进行操作

**我们来重点说一下这个结合Reducer来进行拓展的**
>之前实习的时候碰见过这种写法,在这里我就是着重说一下

## 如何进行优化Provider,useContext这种传递方式



## 应用场景
我们可以用来构造封装自己的状态管理




# 参考资料
[官网](https://react.docschina.org)

