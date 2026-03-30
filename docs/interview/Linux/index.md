# Linux 常用命令

## Linux 文件权限是怎么回事？

Linux 文件权限分为三组：**文件所有者（owner）**、**群组（group）**、**其他用户（others）**。

每个損三种权限：`r`（读）、`w`（写）、`x`（执行）

```bash
ls -l
# -rwxr-xr-- 1 user group 1234 Jan 1 00:00 file.sh
#  ^  ^^^ ^^^
#  |  |   其他用户权限
#  |  群组权限
#  文件所有者权限

# 修改权限
chmod 755 file.sh      # rwxr-xr-x
chmod +x deploy.sh     # 添加执行权限
chmod -w file.txt      # 去除写权限

# 修改所有者
chown user:group file.txt
```

## Linux 常用命令大全

### 文件操作

```bash
ls -la              # 列出包含隐藏文件的详细信息
pwd                 # 显示当前路径
cd /path/to/dir     # 进入目录
mkdir -p a/b/c      # 递归创建目录
rm -rf dir/         # 递归删除目录
cp -r src/ dst/     # 递归删制
mv old.txt new.txt  # 重命名/移动
find . -name '*.js' # 按名称查找文件
touch file.txt      # 创建文件/更新时间戳
```

### 文件查看

```bash
cat file.txt        # 查看文件内容
less file.txt       # 分页查看
head -20 file.txt   # 查看前 20 行
tail -f app.log     # 实时跟踪日志
grep -r 'error' ./  # 递归搜索内容
grep -n 'keyword' file.txt  # 显示行号
```

### 进程相关

```bash
ps aux              # 查看所有进程
ps aux | grep node  # 查找 node 进程
kill -9 PID         # 强制终止进程
top                 # 实时查看进程资源
htop                # 更新界面的 top
nohup node app.js & # 后台运行进程
```

### 网络相关

```bash
curl -X GET 'https://api.example.com'
curl -X POST -H 'Content-Type: application/json' -d '{"key":"val"}' URL
wget https://example.com/file.zip   # 下载文件
netstat -tulpn       # 查看监听端口
ss -tulpn            # 同上，更现代
lsof -i :3000        # 查看占用 3000 端口的进程
```

### 压缩与解压

```bash
tar -czf archive.tar.gz dir/    # 压缩目录
tar -xzf archive.tar.gz         # 解压
zip -r archive.zip dir/         # zip 压缩
unzip archive.zip               # zip 解压
```

### 软连接 vs 硬连接

```bash
ln -s /path/to/original /path/to/link  # 软连接（类似快捷方式）
ln /path/to/original /path/to/link     # 硬连接
```

| 对比 | 软连接 | 硬连接 |
|------|---------|--------|
| 跨文件系统 | 支持 | 不支持 |
| 指向目录 | 支持 | 不支持 |
| 源文件删除 | 连接失效 | 文件仍可访问 |
