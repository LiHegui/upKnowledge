## 说说你对git reset 和 git revert 的理解？区别?
git reset和git revert都是用来撤销更改的命令。
- git reset
    git reset命令会将分支指针和HEAD指针移动到指定的提交，从而撤销之前的提交。这意味着同时也会删除
    git的提交记录。
    功能如下
    - 撤销更改
        可以使用reset来撤销你对代码库所做的更改，并将HEAD指针移动到以前的提交。
        可以使用git reset HEAD~1撤销到最近的一次提交
    - 移动分支
        本地分支与远程分支同步到远程分支最新提交的地方，git reset --head
    - 取消暂存文件
        git reset --mixed将取消暂存你所有的暂存更改
- git revert
    git revert命令会创建一个新的提交，该提交是撤销了之前的提交。也就是说包含了之前的提交相反的更改。
    之前的提交记录有一直都会在，也就是说这种做法更加保险。
## git在错误提交之后，又有几次提交，如何提出这次错误提交，又不影响后面的提交
两种方法可以回滚错误提交
- git revert HEAD
    这将创建一个新的提交，该提交将撤销最新的提交并还原更改。新提交的消息将包含有关回滚的信息
- git reset --hard HEAD~1
    如果您想完全删除最新的提交并将更改还原到之前的状态，可以使用以下命令。谨慎使用
剩下的就是如何恢复后面的提交。 
git reflog => 将列出所有的操作记录，包括已删除的提交。找到你要还原的提交，进行还原新提交
git cherry-pick COMMIT~HASH =>COMMIT~HASH是提交的的hash值。这将创建一个新的提交，包含你要还原的更改
## 说说你对git rebase 和 git merge的理解？区别？
两者都是进行合并分支的操作
- git marge xxx =>是将当前分支和xxx分支进行合并，首先找到里两个分支的最新提交，然后找到两个分支的历史最近祖先，最后将三者合并生成一个新的提交

- git rebase xxx =>是将当前分支嫁接到xxx分支，首先找到两个分支的最近提交祖先，将当前分支在最近祖先后的所有提交修改为暂存提交文件，然后找到目标分支的最新提交位置，最后将暂存的提交文件依次应用到目标分支的最新位置

两者的区别 =>marge的话会将两个分支合并起来，会保留两个分支的历史提交，方便进行回滚操作
            rebase的话会将当前分支嫁接到目标分支，可以有效地合并所有的提交，但是会改变提交历史，影响回滚操作
            
## 说说对git pull 和 git fetch 的理解？有什么区别？
- git fetch <远程主机名origin> <远程分支名master>:<本地分支名temp>
将远程的远程origin仓库的远程master分支下载代码到本地并创建一个新分支temp
如果没有：temp，则是下载到当前分支，这里的git fetch不会进行合并，需要手动git marge进行合并

- git pull <远程主机名origin> <远程分支名master>:<本地分支名branchtest>
将远程的远程origin仓库的远程master分支的代码拉取下来，然后与本地的branchtest分支进行合并
如果没有:branchtest，则是和当前分支进行合并

相同点：都是可以做到代码更新的作用
区别:
git pull=>相当于远程仓库拉取最新的代码，然后自动与本地分支进行合并，所以可能会覆盖本地的修改
git pull相当于git fetch + git marge

git fetch=>也是从远程获取最新代码，然后根据实际情况决定是否进行合并操作

## 说说你对git stash 的理解？应用场景？
stash本意是暂存存放的意思，可以理解保存当前进度，吧暂存区和工作区的工作内容保存到到一个栈中，可以在后续的任何分支任何时候将栈中的内容重新应用出来 

- git stash => 用于保存当前进度，吧暂存区和工作区的代码改动保存起来

- git stash save => 和git stash作用一样，目前已经被弃用

- git stash list => 用于查看当前保存区中所有的存储列表，它会显示每个存储条目的索引、描述内容以及存储条目的更改数量
执行实例：
    stash@{0}: On master: My temporary changes
    stash@{1}: On feature-branch: Another set of changes
    在第一条中，master代表分支，My temporary changes代表内容描述
    可以用git stash apply或者git stash pop应用或者弹出存储条目 => git stash pop stash@{0}

- git stash pop => 默认读取存储栈中最后一次提交的内容，也就是找到栈顶stash内容恢复到工作区，同时删除该存储条目，也可以通过git stash pop stash@{0}指定需要恢复的存储条目，恢复之后如果发生冲突，需要手动修复或者新建分支来解决

- git stash apply => 和git stash pop作用一样，都是恢复一次提交内容到工作区，但是不会在存储栈中删除该存储条目

- git stash show => 用于查看存储栈中一个存储条目的更改内容，默认查看最新一次的存储条目，也可以通过添加索引来查看指定存储条目的更改内容

- git stash drop => 用于移除指定索引的存储条目

- git stash clear => 用于删除所有的存储条目

应用场景：
1.当开发进行一半时，需要同步远程代码时，如果远程和本地没有冲突，可以使用git pull直接拉取
    如果有冲突时，git pull不能覆盖当前的修改可以执行
    git stash => git pull => git stash pop来解决

2.当开发进行了一半，需要去操作另一个分支时，可以用git stash进行缓存当前更改的内容，可以执行
    git stash => git commit -m "修改内容" => git stash pop来解决

## 说说Git 中 HEAD、工作树和索引之间的区别？
三者没有大致的共同点：
HEAD指针通常指向我们所在的分支，当我们在某个分支上创建新的提交时，分支指针总是指向当前最新的提交
工作树通常指当前的工作目录，是正在查看或者正在修改的文件地方
索引是一个中间状态，工作树的代码需要先git add添加索引到索引区域才能git commit到git仓库

## 命令行git指令
mkdir xx（文件名）：创建指定文件
cd xx（文件名）：跳转到指定目录
git branch -d xx（分支名）：删除指定本地分支
git push origin -d xx（分支名）：删除指定远程分支
git status：查看当前分支修改状态
git log：查看提交日志
git blame -L 1,100 文件地址：查看文件中1-100行的改动记录
vi xx（文件地址）：在终端编辑文件
i：修改文件 wq：退出编辑文件
git pull --rebase origin master：拉取代码
git push -u origin master：推送代码
git config -e：修改git初始化配置文件
git tag -a XX（tag名）-m "提交注释" xx（提交版本号）：项目打tag
git push -u origin XX（tag名）：推送tag
 
