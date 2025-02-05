# pull

# merge

# fetch
之前我们说过 git pull = git fetch + git merge
执行pull操作是直接将其拉取进行合并

# rebase
rebase实际上就是取出一系列的提交记录，“复制”，放在另外一个地方进行操作提交。
rebase可以创造更加线性的提交历史。

# HEAD
HEAD是对当前所在分支的符号引用--也就是指向你正在基础上进行工作的提交记录。
HEAD总是指向当前分支上的最近一次的提交。
**分离的HEAD**
分离的HEAD就是让其指向了某个具体的提交记录而不是分支名。
分离时是没有办法使用reset, 可以使用checkout

强制指向
```
    git branch -f [yourbranch] [HashValue]
```
# 相对引用
当前分支上
```
git chekout HEAD^
```
# 撤销变更
撤销变更是由更底层部分（暂存区的独立片段或者片段）和上层部分（变更到底是通过哪种方式被撤销的）。
## reset
```
git reset HEAD
```
会导致本地的记录确实
## revert
```
git revert HEAD
```
会进行重新提交，相当于把前一个节点进行覆盖commit,之前的记录不会缺失

# 自由修改
## cherry-pick
```
git cherry-pick <提交号>...
```
将一些提交**复制**到当前所在的位置（HEAD）下面
cherry-pick 是最直接的方式
要在心里牢记 cherry-pick 可以将提交树上任何地方的提交记录取过来追加到 HEAD 上（只要不是 HEAD 上游的提交就没问题）。


## 交互式的rebase
如果我们知道对应的提交记录以及它的哈希值，用cherry-pick是极其简单的。
如果我们并不清楚所对应的hash值，接下来就是我所要说的内容
所谓是交互式的rebase,是指携带 --interactive的rebase命令，简写-i

1. 我们使用了该命令
    在之前的4次提交记录进行自由选择顺序，自由剔除
    ```
        git rebase -i HEAD~4    
    ```
2. Git会打开一个UI界面并列出将要被复制到目标分支的备选提交记录。
3. 然后用鼠标拖放完成

# tag
> 永久指向某个提交记录的标识

# describe
用来描述离当前位置最近的锚点
```
git describe <ref>
```
会显示结果
```
<tag>_<numCommits>_g<hash>
```
上面的结果清晰明了，在这里就不再赘述

# clone

# 高级
## 多分支
