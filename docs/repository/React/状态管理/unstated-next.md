## 200 字节让你永远不再考虑 React 状态管理库

## 源码解析

这个包的源码很短，我们可以来看一下

```typescript
import React from "react"

export interface ContainerProviderProps<State = void> {
	initialState?: State
	children: React.ReactNode
}

export interface Container<Value, State = void> {
	Provider: React.ComponentType<ContainerProviderProps<State>>
	useContainer: () => Value
}

export function createContainer<Value, State = void>(
	useHook: (initialState?: State) => Value,
): Container<Value, State> {
	let Context = React.createContext<Value | null>(null)

	function Provider(props: ContainerProviderProps<State>) {
		let value = useHook(props.initialState)
		return <Context.Provider value={value}>{props.children}</Context.Provider>
	}

	function useContainer(): Value {
		let value = React.useContext(Context)
		if (value === null) {
			throw new Error("Component must be wrapped with <Container.Provider>")
		}
		return value
	}

	return { Provider, useContainer }
}

export function useContainer<Value, State = void>(
	container: Container<Value, State>,
): Value {
	return container.useContainer()
```