
# 点击访问 -> [升级打怪🎯](https://lihegui.github.io/upKnowledge/#%F0%9F%9A%80-%E7%9F%A5%E8%AF%86%E5%BA%93)

# 每个文件夹放着对应的题目
## 默写.md是供默写所用的

# 文档书写
## 所有格式按照markdown格式去写，说明文档都要命名成markdown格式

# 发博客声明

有些文章已经发过了，会有标识**已发**。

都可以发，每个文档整理差不多了，都是可以发的

# 目录说明

- docs
 - interview (面试题)
- project (空白项目都可以进行改动,可以做一些测试，功能实现，这部分比较随意，可以随意改动)

# 提交规范
## 采用变基rebase
## commit 说明
- fix 修复错误
- feature 新模块新功能
- style 样式修改
- docs 文档修改
## 提交流程
你的分支（shen）
 - commit 提交代码
 - 切换分支master
 - master同步远程代码并并合并
 - 切回shen分支，rebase本地master分支，可推你的远程分支，可推可不推
 - 切回本地master分支，merge本地shen分支
 - git push 推到远程分支master
## 解决冲突
- 获取远程仓库最新代码：git pull origin 分支name
    将远程仓库的最新代码合并到本地仓库
- 打开冲突文件，查看冲突内容。
    在冲突文件中标记出两个不同版本的代码
- 手动解决冲突。
    手动选择每个冲突保留哪个版本或者进行修改，直到解决所有冲突
- 提交代码：git commit -m "提交描述"
    提交解决冲突后的代码到本地仓库
- 推送代码到远程仓库：git push origin 分支name
    将解决冲突后的代码推送到远程仓库


# 快速运行项目
yarn develop

目前还有很多目录没有同步到文档之中

自己看到哪，顺便把目录同步到文档里面（路由）

# project 都是干净的项目，可以随意使用，甚至于删除
