# Git 面试题

> 涵盖 Git 日常开发核心知识：分支管理、版本回退、合并策略、暂存机制、远程同步等高频考点。

---

## 基础概念篇

## Q: HEAD、工作树、索引

**A:**

三者职责各不相同：

- **HEAD**：当前分支的符号引用，总是指向当前分支上最近一次提交。当在某个分支上新建提交时，分支指针会随之向前移动。
- **工作树（Working Tree）**：当前工作目录，即你正在查看或修改的文件所在的地方。
- **索引 / 暂存区（Index / Staging Area）**：介于工作树和仓库之间的中间状态，工作树的修改需先 `git add` 到索引，再 `git commit` 才能进入 Git 仓库。

```
工作树 --git add--> 索引（暂存区） --git commit--> 本地仓库 --git push--> 远程仓库
```

---

## Q: 分离的 HEAD

**A:**

正常情况下，**HEAD 指向分支名**，分支名再指向最新的 commit。

**分离的 HEAD** 是指 HEAD 直接指向某个具体的 commit hash，而不是分支名：

```bash
git checkout <commit-hash>   # 进入分离 HEAD 状态
```

> ⚠️ **注意**：分离状态下无法使用 `git reset` 操作分支，新建的提交也不属于任何分支，切换分支后会丢失。如需保留，应创建新分支：`git checkout -b new-branch`。

**相对引用** — 快速定位历史提交：

```bash
git checkout HEAD^     # 上一个提交
git checkout HEAD~3    # 往前第 3 个提交

git branch -f main HEAD~3        # 强制将 main 分支指向当前位置往前第 3 个提交
git branch -f <branch> <hash>    # 强制将分支指向指定 commit
```

---

## 版本回退篇

## Q: git reset vs revert

**A:**

两者都用于撤销更改，但实现机制和适用场景不同。

**git reset** — 移动 HEAD 和分支指针，"抹掉"历史记录：

```bash
git reset --soft HEAD~1    # 回退 1 个 commit，保留暂存区和工作区
git reset --mixed HEAD~1   # 回退 1 个 commit，清空暂存区，保留工作区（默认）
git reset --hard HEAD~1    # 回退 1 个 commit，清空暂存区，删除工作区改动
```

| 参数 | HEAD | 暂存区 | 工作区文件 |
|------|------|--------|-----------|
| `--soft` | 回退 | ✅ 保留 | ✅ 保留 |
| `--mixed`（默认） | 回退 | ❌ 清空 | ✅ 保留 |
| `--hard` | 回退 | ❌ 清空 | ❌ 删除 |

> ⚠️ **注意**：`--hard` 会直接删除工作区文件，操作前务必确认。撤销 merge commit 但不想丢失代码时，优先使用 `--soft`。

**git revert** — 创建一个新的「反向提交」来抵消指定提交，历史记录完整保留：

```bash
git revert HEAD    # 撤销最新一次提交，生成新提交
```

**核心区别：**

| 维度 | git reset | git revert |
|------|-----------|------------|
| 历史记录 | ❌ 覆盖/删除 | ✅ 完整保留 |
| 是否新增提交 | ❌ 否 | ✅ 是 |
| 适合场景 | 本地尚未推送的提交 | 已推送到远程的提交 |
| 安全性 | 较低（`--hard` 有风险） | 较高 |

---

## Q: 错误提交回退策略

**A:**

推荐使用 `git revert` + `git cherry-pick` 组合方案：

**方法一：git revert（推荐，适合已推送远程）**

```bash
git revert <错误提交的 hash>   # 生成一个反向提交，抵消该次错误
```

不会影响其他提交记录，最安全。

**方法二：git reset + git cherry-pick（适合本地未推送）**

```bash
git reset --hard <错误提交前一个的 hash>   # 回退到错误提交之前
git reflog                                  # 查看所有操作记录，找到后续提交的 hash
git cherry-pick <hash1> <hash2> ...         # 将后续提交逐个重新应用
```

> ⚠️ **注意**：`git reflog` 是救命工具，即使 `reset --hard` 后也能找回丢失的提交记录。

---

## 分支管理篇

## Q: git rebase vs merge

**A:**

两者都用于合并分支，但策略不同：

**git merge** — 三方合并，保留完整历史：

```bash
git merge feature    # 将 feature 分支合并到当前分支
```

找到两个分支的**最近公共祖先**，将三者（祖先 + 两个分支最新提交）合并生成一个新的 merge commit。

**git rebase** — 变基，创建线性历史：

```bash
git rebase main    # 将当前分支"嫁接"到 main 分支最新提交之后
```

找到两个分支的公共祖先，将当前分支在祖先之后的所有提交「复制」并依次应用到目标分支的最新位置，提交历史变为一条直线。

**核心区别：**

| 维度 | git merge | git rebase |
|------|-----------|------------|
| 历史记录 | 保留分支合并轨迹 | 线性，整洁 |
| 是否新增 commit | ✅ 会生成 merge commit | ❌ 不新增（复制原 commit） |
| 冲突处理 | 一次性解决 | 逐个 commit 解决 |
| 适合场景 | 功能分支合并到主干 | 同步主干更新到特性分支 |

> ⚠️ **注意**：`rebase` 会改写提交历史，已推送到远程的分支谨慎使用，避免影响他人。

---

## Q: git cherry-pick 选择应用

**A:**

`git cherry-pick` 可以将**任意分支上的指定提交**复制到当前分支（HEAD 位置），而不需要合并整个分支。

```bash
git cherry-pick <hash>              # 复制单个提交
git cherry-pick <hash1> <hash2>     # 复制多个提交（按顺序应用）
git cherry-pick <hash1>..<hash2>    # 复制一个范围内的提交
```

**典型使用场景：**
- 从其他分支摘取某个特定的 bug 修复，应用到当前分支
- 错误提交后，用 cherry-pick 重新"播放"后续提交（见上题）
- 在不同发布版本间同步某个功能补丁

---

## Q: 交互式 rebase

**A:**

交互式 rebase 是 `git rebase` 携带 `--interactive`（简写 `-i`）参数的模式，它会打开一个编辑器界面，让你对**一批提交记录自由操作**：

```bash
git rebase -i HEAD~4    # 对最近 4 次提交进行交互式整理
```

在交互界面中可以：

| 操作 | 说明 |
|------|------|
| `pick` | 保留该提交（默认） |
| `reword` | 保留但修改提交信息 |
| `squash` | 合并到上一个提交 |
| `drop` | 删除该提交 |
| 调整顺序 | 直接拖动/编辑行顺序 |

**适用场景：**
- 上线前整理 commit 历史（squash 多个 WIP 提交为一个）
- 删除调试用的临时提交
- 修改历史提交信息

> ⚠️ **注意**：和 rebase 一样，会改写历史，同样不建议对已推送的提交使用。

---

## 远程同步篇

## Q: git pull vs fetch

**A:**

两者都能从远程获取最新代码，区别在于是否自动合并：

**git fetch** — 只下载，不合并：

```bash
git fetch origin master:temp    # 下载远程 master 到本地新建分支 temp
git fetch origin                # 下载所有远程更新，不合并
git merge temp                  # 手动决定是否合并
```

**git pull** — 下载 + 自动合并（等价于 `git fetch + git merge`）：

```bash
git pull origin master:branchtest    # 拉取远程 master 并合并到本地 branchtest
git pull                             # 拉取并合并到当前分支
git pull --rebase origin master      # 拉取后用 rebase 代替 merge 合并
```

**核心区别：**

| 维度 | git fetch | git pull |
|------|-----------|----------|
| 是否自动合并 | ❌ 否，需手动 merge | ✅ 是 |
| 是否覆盖本地修改 | ❌ 不会 | ⚠️ 可能（有冲突时） |
| 灵活性 | 高（可先review再合并） | 低 |
| 适合场景 | 想先查看远程变更再决策 | 快速同步且无冲突场景 |

---

## 暂存管理篇

## Q: git stash 暂存管理

**A:**

`git stash`（暂存/藏匿）用于将**工作区和暂存区的未提交改动**保存到一个栈结构中，让工作目录恢复干净，后续可在任意分支随时取出还原。

**常用命令：**

| 命令 | 说明 |
|------|------|
| `git stash` | 保存当前所有改动到栈顶 |
| `git stash list` | 查看所有存储条目 |
| `git stash pop` | 取出栈顶内容并**删除**该条目 |
| `git stash apply stash@{0}` | 取出指定条目但**不删除** |
| `git stash show` | 查看最新存储条目的改动内容 |
| `git stash drop stash@{0}` | 删除指定存储条目 |
| `git stash clear` | 清空所有存储条目 |

> ⚠️ **注意**：`git stash save` 已被弃用，直接使用 `git stash` 即可。`git stash pop` 恢复时若有冲突需手动解决。

**典型应用场景：**

```bash
# 场景一：开发到一半，需要同步远程代码
git stash
git pull
git stash pop

# 场景二：开发到一半，需要切换到其他分支紧急修复
git stash
git checkout hotfix-branch
# ... 修复并提交 ...
git checkout feature-branch
git stash pop
```

---

## 其他工具篇

## Q: git tag 标签管理

**A:**

`git tag` 用于创建**永久指向某个 commit 的标签**，通常用于标记版本发布节点（如 `v1.0.0`）。

与分支不同，tag 不会随新提交移动，是静态标记。

```bash
git tag v1.0.0                                  # 轻量标签（当前 HEAD）
git tag -a v1.0.0 -m "正式发布 v1.0.0" <hash>  # 附注标签（推荐）
git push origin v1.0.0                          # 推送指定 tag
git push origin --tags                          # 推送所有 tag
git tag -d v1.0.0                               # 删除本地 tag
```

---

## Q: git describe 版本描述

**A:**

`git describe` 用于**描述当前提交离最近一个 tag 的距离**，常用于自动生成版本号：

```bash
git describe <ref>
```

输出格式：

```
<tag>_<numCommits>_g<hash>
```

例如 `v1.0.0_3_gabcdef1` 表示：距离 `v1.0.0` tag 有 3 次提交，当前 commit hash 为 `abcdef1`。

---

## Q: Git 常见命令速查

**A:**

**仓库与配置：**

```bash
git config -e                          # 编辑 git 配置文件
git clone <url>                        # 克隆远程仓库
```

**分支操作：**

```bash
git branch -d <branch>                 # 删除本地分支
git push origin -d <branch>            # 删除远程分支
git checkout -b <branch>               # 创建并切换分支
```

**查看状态：**

```bash
git status                             # 查看当前分支修改状态
git log                                # 查看提交日志
git reflog                             # 查看所有操作记录（含已删除提交）
git blame -L 1,100 <file>              # 查看文件 1-100 行的修改记录
```

**提交与推送：**

```bash
git add .                              # 暂存所有修改
git commit -m "message"               # 提交
git push -u origin master             # 推送到远程
git pull --rebase origin master       # 拉取并用 rebase 合并
```

**Tag 管理：**

```bash
git tag -a <tag> -m "注释" <hash>     # 创建附注 tag
git push -u origin <tag>              # 推送 tag
```

