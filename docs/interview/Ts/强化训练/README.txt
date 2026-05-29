TS 强化训练 100 题 — 训练完可整个文件夹删除
============================================================

【目录】
  _utils.ts                类型断言工具（Equal / Expect）
  01-basics.ts             基础类型 15 题
  02-generics.ts           函数与泛型 15 题
  03-keyof-typeof.ts       keyof / typeof / 索引访问 15 题
  04-utility-types.ts      内置工具类型手写实现 20 题
  05-conditional-infer.ts  条件类型与 infer 15 题
  06-mapped-template.ts    映射类型 + 模板字面量 12 题
  07-challenges.ts         综合类型体操 8 题
  solutions.ts             全部参考答案（卡住再看）

【训练方式】
  1. 打开 01-basics.ts，按题号顺序做
  2. 每题把 `type Q1 = any` 中的 any 替换成你的答案
  3. 答案正确 → 该题下方的 `type case_Q1 = Expect<Equal<...>>` 不报错
  4. 答案错误 → tsc / VS Code 立刻红波浪线，根据提示修正
  5. 实在卡住 → 翻 solutions.ts 看参考答案，理解后回来重写

【强烈建议】
  - 不要复制答案。手写比看 100 遍更管用
  - 每天 10~15 题，3 周内推完
  - 第 04 / 05 / 07 是面试手写题重灾区，务必反复练
