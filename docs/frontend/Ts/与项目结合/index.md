# TypeScript 与项目结合

> 专题：TypeScript 如何在 Vue / React 工程中真正落地。覆盖 tsconfig、组件边界、组合式函数 / Hook、状态管理、接口层校验、工程化兜底、Monorepo 类型共享等实战要点。

---

## Q: TypeScript 如何与 Vue / React 项目结合得更好？

**A:**

核心思路一句话：**编译期靠 tsconfig + 组件边界严格类型化，运行时靠 Zod / 守卫兜底，工程链路靠 vue-tsc / tsc --noEmit 把关**。

下文按 **工程配置 → Vue 实战 → React 实战 → 接口层 → 工程兜底 → Monorepo** 顺序展开。

---

### 一、tsconfig 关键开关

无论 Vue 还是 React，新项目至少要开这几项（按重要度排序）：

```jsonc
{
  "compilerOptions": {
    // 必开
    "strict": true,                       // 等同于打开下面一组 strict 选项
    "noImplicitAny": true,                // 隐式 any 报错
    "strictNullChecks": true,             // null/undefined 必须显式处理
    "strictFunctionTypes": true,          // 函数参数协变检查
    "noImplicitThis": true,               // this 隐式 any 报错

    // 强烈推荐
    "noUncheckedIndexedAccess": true,     // arr[0] 推断为 T | undefined
    "exactOptionalPropertyTypes": true,   // 可选属性不可显式赋 undefined
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,

    // 模块解析
    "module": "ESNext",
    "moduleResolution": "Bundler",        // Vite / 现代打包器推荐
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "preserve",                    // Vue: preserve；React 17+: react-jsx
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "isolatedModules": true,              // 配合 SWC / esbuild 单文件编译
    "skipLibCheck": true,

    // 路径别名
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@shared/*": ["packages/shared/src/*"]
    }
  },
  "include": ["src/**/*", "src/**/*.vue"],
  "exclude": ["node_modules", "dist"]
}
```

> ⚠️ **注意**：`paths` 只影响 TS 类型解析，**不影响打包**。打包器（Vite / Webpack）必须额外配置同名别名（`resolve.alias` 或 `vite-tsconfig-paths` 插件），否则运行时会找不到模块。

---

### 二、Vue 3 项目实战

#### 1. 组件 Props / Emits / Model / Expose

```vue
<script setup lang="ts">
import { ref } from 'vue'

interface User {
  id: number
  name: string
  role?: 'admin' | 'user'
}

// Props：纯类型声明 + 默认值
const props = withDefaults(defineProps<{
  list: User[]
  pageSize?: number
  loading?: boolean
}>(), {
  pageSize: 10,
  loading: false,
})

// Emits：用元组类型描述参数，类型最准
const emit = defineEmits<{
  change: [id: number]
  remove: [user: User]
  'update:keyword': [value: string]
}>()

// v-model：3.4+ 的 defineModel
const keyword = defineModel<string>('keyword', { default: '' })

// 暴露给父组件 ref 的类型
const inputRef = ref<HTMLInputElement | null>(null)
defineExpose({
  focus: () => inputRef.value?.focus(),
  clear: () => { keyword.value = '' },
})
</script>
```

父组件拿到子组件 ref 时获得完整类型：

```vue
<script setup lang="ts">
import UserList from './UserList.vue'

const listRef = ref<InstanceType<typeof UserList> | null>(null)
// listRef.value?.focus() / clear() 都有提示
</script>
```

#### 2. 泛型组件（Vue 3.3+）

```vue
<script setup lang="ts" generic="T extends { id: number }">
defineProps<{
  list: T[]
  renderItem?: (item: T) => string
}>()

const emit = defineEmits<{ select: [item: T] }>()
</script>

<template>
  <li v-for="item in list" :key="item.id" @click="emit('select', item)">
    {{ renderItem ? renderItem(item) : item.id }}
  </li>
</template>
```

用法：`<GenericList<User> :list="users" @select="onSelect" />`，回调参数 `item` 自动为 `User`。

#### 3. 组合式函数（Composables）

```ts
import { ref, onUnmounted } from 'vue'

export interface UseFetchOptions {
  immediate?: boolean
}

export function useFetch<T>(url: string, options: UseFetchOptions = {}) {
  const data = ref<T | null>(null)
  const error = ref<Error | null>(null)
  const loading = ref(false)

  const run = async () => {
    loading.value = true
    try {
      const res = await fetch(url)
      data.value = (await res.json()) as T
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  if (options.immediate) run()
  onUnmounted(() => { /* cleanup */ })

  return { data, error, loading, run }
}

// 调用方
const { data, loading } = useFetch<User[]>('/api/users', { immediate: true })
// data.value: User[] | null
```

#### 4. Pinia Store 类型化

```ts
import { defineStore } from 'pinia'

interface UserState {
  list: User[]
  current: User | null
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    list: [],
    current: null,
  }),
  getters: {
    adminCount: (state): number =>
      state.list.filter(u => u.role === 'admin').length,
  },
  actions: {
    async fetch(): Promise<void> {
      this.list = await api.getUsers()
    },
    select(id: number): void {
      this.current = this.list.find(u => u.id === id) ?? null
    },
  },
})
```

> 关键：**`state` 函数必须显式标注返回类型**，否则空数组会被推断为 `never[]`，后面 push 时全报错。

#### 5. 全局类型扩展

`src/env.d.ts`：

```ts
/// <reference types="vite/client" />

// 给 Window 加自定义属性
declare global {
  interface Window {
    __APP_VERSION__: string
  }
}

// 给 .vue 文件加类型
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

export {}
```

---

### 三、React 项目实战

#### 1. 组件 Props 与函数组件

```tsx
import type { ReactNode, MouseEvent } from 'react'

interface UserListProps {
  list: User[]
  /** 渲染列表项的可选自定义函数 */
  renderItem?: (user: User) => ReactNode
  onSelect: (id: number) => void
  children?: ReactNode
}

// 推荐：直接解构 Props，不要 React.FC
// React.FC 会强行带上 children 类型，且不支持泛型组件
export function UserList({
  list,
  renderItem,
  onSelect,
  children,
}: UserListProps) {
  const handleClick = (e: MouseEvent<HTMLLIElement>, id: number) => {
    e.stopPropagation()
    onSelect(id)
  }

  return (
    <ul>
      {list.map(u => (
        <li key={u.id} onClick={e => handleClick(e, u.id)}>
          {renderItem ? renderItem(u) : u.name}
        </li>
      ))}
      {children}
    </ul>
  )
}
```

#### 2. 泛型组件

```tsx
interface SelectProps<T> {
  options: T[]
  value: T
  getLabel: (item: T) => string
  onChange: (item: T) => void
}

export function Select<T>({ options, value, getLabel, onChange }: SelectProps<T>) {
  return (
    <select
      value={getLabel(value)}
      onChange={e => {
        const next = options.find(o => getLabel(o) === e.target.value)
        if (next) onChange(next)
      }}
    >
      {options.map(o => (
        <option key={getLabel(o)} value={getLabel(o)}>{getLabel(o)}</option>
      ))}
    </select>
  )
}

// 使用时 T 被自动推断为 User
<Select<User>
  options={users}
  value={current}
  getLabel={u => u.name}
  onChange={u => setCurrent(u)}
/>
```

#### 3. Hook 类型（useState / useRef / useReducer）

```tsx
// useState：初始为 null 时必须显式给联合类型
const [user, setUser] = useState<User | null>(null)

// useRef：DOM ref 必须给 null
const inputRef = useRef<HTMLInputElement>(null)

// useReducer：用 discriminated union 描述 action
type Action =
  | { type: 'add'; payload: User }
  | { type: 'remove'; payload: number }
  | { type: 'reset' }

function reducer(state: User[], action: Action): User[] {
  switch (action.type) {
    case 'add':    return [...state, action.payload]
    case 'remove': return state.filter(u => u.id !== action.payload)
    case 'reset':  return []
  }
}

const [users, dispatch] = useReducer(reducer, [])
dispatch({ type: 'add', payload: { id: 1, name: 'a' } })  // 类型完整提示
```

#### 4. 自定义 Hook + 泛型

```tsx
export function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let aborted = false
    setLoading(true)
    fetch(url)
      .then(r => r.json() as Promise<T>)
      .then(d => { if (!aborted) setData(d) })
      .catch(e => { if (!aborted) setError(e as Error) })
      .finally(() => { if (!aborted) setLoading(false) })
    return () => { aborted = true }
  }, [url])

  return { data, loading, error }
}

// 用法
const { data } = useFetch<User[]>('/api/users')   // data: User[] | null
```

#### 5. Context + 守卫断言

```tsx
import { createContext, useContext } from 'react'

interface AuthCtx {
  user: User
  logout: () => void
}

const AuthContext = createContext<AuthCtx | null>(null)

// 守卫 Hook：消除 null 的判断负担
export function useAuth(): AuthCtx {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
```

#### 6. Redux Toolkit Slice

```ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface UserState {
  list: User[]
  current: User | null
}

const initialState: UserState = { list: [], current: null }

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setList(state, action: PayloadAction<User[]>) {
      state.list = action.payload
    },
    select(state, action: PayloadAction<number>) {
      state.current = state.list.find(u => u.id === action.payload) ?? null
    },
  },
})

export const { setList, select } = userSlice.actions
export default userSlice.reducer

// store.ts
export const store = configureStore({ reducer: { user: userSlice.reducer } })
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// 自定义 typed hooks
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux'
export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
```

---

### 四、接口层：类型 ≠ 安全，必须运行时校验

类型只在编译期存在，后端返回的数据在运行时可能跟类型完全不一致。**接口边界必须用运行时校验库**，推荐 [Zod](https://zod.dev/)。

```ts
import { z } from 'zod'

const UserSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  role: z.enum(['admin', 'user']).optional(),
})

// 直接从 schema 推导出 TS 类型，单一数据源
export type User = z.infer<typeof UserSchema>

export async function getUsers(): Promise<User[]> {
  const res = await fetch('/api/users').then(r => r.json())
  // 校验失败会抛错；安全模式用 .safeParse 拿 result.success
  return z.array(UserSchema).parse(res)
}
```

封装 axios / fetch 拦截器，统一校验：

```ts
export async function request<T>(url: string, schema: z.ZodType<T>): Promise<T> {
  const json = await fetch(url).then(r => r.json())
  const result = schema.safeParse(json)
  if (!result.success) {
    console.error('[API schema mismatch]', url, result.error.format())
    throw new Error('接口数据格式异常')
  }
  return result.data
}
```

---

### 五、工程化兜底

#### 1. CI 必跑类型检查

```jsonc
// package.json
{
  "scripts": {
    "typecheck": "tsc --noEmit",            // React 项目
    "typecheck:vue": "vue-tsc --noEmit",    // Vue 项目（需安装 vue-tsc）
    "lint": "eslint . --ext .ts,.tsx,.vue",
    "ci": "pnpm typecheck && pnpm lint && pnpm test"
  }
}
```

> 关键：Vite / Vue CLI 默认**不会做类型检查**，只做转译。必须在 CI 单独跑 `vue-tsc --noEmit`，否则线上代码可能带类型错误。

#### 2. ESLint 加 TS 规则

```js
// eslint.config.js (Flat Config)
import tseslint from 'typescript-eslint'

export default tseslint.config(
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: { project: './tsconfig.json' },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',  // 强制 import type
      '@typescript-eslint/no-floating-promises': 'error',     // 必须 await 或 .catch
      '@typescript-eslint/no-misused-promises': 'error',
    },
  }
)
```

#### 3. Git Hook：提交前校验

```jsonc
// husky + lint-staged
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "bash -c 'tsc --noEmit'"],
    "*.vue": ["eslint --fix", "bash -c 'vue-tsc --noEmit'"]
  }
}
```

---

### 六、Monorepo 类型共享

`packages/shared/` 放公共类型，前后端 / 多端复用：

```text
my-monorepo/
├─ packages/
│  ├─ shared/        # 共享类型 & schema
│  │  └─ src/
│  │     ├─ user.ts  # User 类型 + Zod schema
│  │     └─ api.ts   # 接口 DTO
│  ├─ web/           # Vue / React 前端
│  └─ server/        # Node 后端
└─ tsconfig.base.json
```

各包通过 `paths` 引用：

```ts
// packages/web/src/api/user.ts
import { UserSchema, type User } from '@shared/user'
```

> **优势**：前后端共用一份 `UserSchema`，接口字段改动时编译期就能感知，杜绝「后端改字段、前端没人通知」的事故。

---

### 七、常见反模式速查

| 反模式 | 问题 | 正确做法 |
| --- | --- | --- |
| 大量 `any` 兜底 | 失去类型保护，等同于 JS | 用 `unknown` + 类型收窄 |
| `as` 强转后不验证 | 运行时崩溃风险 | 类型守卫 / Zod 校验 |
| Vue 同时用 PropTypes + TS Props | 重复声明，维护成本翻倍 | 只用 `defineProps<T>()` |
| React 用 `React.FC` | 强制带 children，不支持泛型 | 直接解构 Props |
| Store 初始 state 不标类型 | 推断为 `never[]` / `{}` | 显式 `: UserState` |
| 只信 tsconfig 不跑 CI | dev 默认不报类型错误，线上才发现 | CI 跑 `tsc --noEmit` |
| 接口返回直接 `as User` | 后端字段变了无感知 | Zod schema + `.parse` |
| `paths` 配了但忘了 bundler | 编辑器不报错，打包失败 | Vite 装 `vite-tsconfig-paths` |

---

### 八、面试加分点

- 能讲清楚 **`React.FC` 为什么不推荐**（隐式 children + 不支持泛型组件）
- 能讲清楚 **Vue3 泛型组件**（`<script setup lang="ts" generic="T">`）的使用场景
- 能讲清楚 **类型只在编译期，运行时必须校验**（Zod / 类型谓词）
- 能讲清楚 **`paths` 与 bundler alias 的区别**（一个管类型、一个管打包）
- 能讲清楚 **`vue-tsc` 与 `tsc` 的区别**（前者解析 `.vue` SFC）
- 能讲清楚 **`noUncheckedIndexedAccess` 的价值**（避免 `arr[0]` 假装非空）

---
