# Docker 速通

## 基础概念篇

## Q: Docker 是什么？解决了什么问题？

**A:**

**Docker** 是一个开源的容器化平台，将应用程序及其所有依赖（代码、运行时、系统工具、库、配置）打包成一个标准化单元 —— **容器（Container）**。

**解决的核心问题：**

> "在我机器上能跑" → 容器保证在任何环境下行为一致

| 痛点 | Docker 解法 |
|------|------------|
| 环境不一致（dev/test/prod） | 容器镜像包含完整运行环境，一次构建到处运行 |
| 依赖冲突（项目 A 需要 Node 16，项目 B 需要 Node 20） | 每个容器独立隔离，互不影响 |
| 部署繁琐（手动配置服务器环境） | `docker run` 一条命令启动 |
| 资源浪费（虚拟机笨重） | 容器共享宿主机内核，启动快、占用少 |

---

## Q: 容器和虚拟机（VM）有什么区别？

**A:**

| 维度 | 虚拟机（VM） | 容器（Container） |
|------|------------|-----------------|
| 隔离层 | 硬件级虚拟化（Hypervisor） | 操作系统级虚拟化（namespace + cgroups） |
| 内核 | 每个 VM 有独立内核 | 共享宿主机内核 |
| 体积 | GB 级（含完整 OS） | MB 级（只含应用和依赖） |
| 启动速度 | 分钟级 | 秒级甚至毫秒级 |
| 资源开销 | 高 | 低 |
| 隔离性 | 强（完整 OS 隔离） | 较强（进程级隔离） |

```
虚拟机架构：               容器架构：
┌────────────────┐        ┌────────────────┐
│   App A  App B │        │ App A   App B  │
│   Bins/Libs    │        │ Bins/Libs      │
│   Guest OS     │        └────────────────┘
│   Hypervisor   │        │   Docker 引擎   │
│   Host OS      │        │   Host OS      │
│   Hardware     │        │   Hardware     │
└────────────────┘        └────────────────┘
```

---

## Q: Docker 的三大核心概念是什么？

**A:**

| 概念 | 类比 | 说明 |
|------|------|------|
| **Image（镜像）** | 类 / 模板 | 只读的静态文件，包含应用运行所需的一切；类比面向对象中的「类」 |
| **Container（容器）** | 对象 / 实例 | 镜像运行起来的实例，有独立的文件系统、网络、进程空间；类比「对象」 |
| **Registry（仓库）** | npm / App Store | 存储和分发镜像的服务，官方是 [Docker Hub](https://hub.docker.com) |

```
Image（镜像）──── docker run ────▶ Container（容器）
    ▲                                      │
    │                                      │ docker commit
    │                                      ▼
Registry ◀── docker push/pull ──── 新 Image
```

---

## 镜像篇

## Q: Dockerfile 的常用指令有哪些？

**A:**

| 指令 | 作用 | 示例 |
|------|------|------|
| `FROM` | 指定基础镜像 | `FROM node:20-alpine` |
| `WORKDIR` | 设置工作目录（不存在则自动创建） | `WORKDIR /app` |
| `COPY` | 复制宿主机文件到镜像 | `COPY . .` |
| `ADD` | 类似 COPY，额外支持 URL 和 tar 自动解压 | `ADD app.tar.gz /app` |
| `RUN` | 构建时执行命令（结果写入镜像层） | `RUN npm ci` |
| `CMD` | 容器启动时的默认命令（可被覆盖） | `CMD ["node", "server.js"]` |
| `ENTRYPOINT` | 容器启动时必须执行的命令（不可被覆盖） | `ENTRYPOINT ["nginx"]` |
| `ENV` | 设置环境变量 | `ENV NODE_ENV=production` |
| `ARG` | 定义构建时变量（`docker build --build-arg` 传入） | `ARG VERSION=1.0` |
| `EXPOSE` | 声明容器监听的端口（仅文档作用） | `EXPOSE 3000` |
| `VOLUME` | 声明挂载点 | `VOLUME ["/data"]` |
| `USER` | 指定运行用户（安全最佳实践） | `USER node` |

---

## Q: CMD 和 ENTRYPOINT 有什么区别？

**A:**

| 维度 | CMD | ENTRYPOINT |
|------|-----|-----------|
| 能否被 `docker run` 参数覆盖 | ✅ 可以 | ❌ 不能（除非用 `--entrypoint`） |
| 作用 | 提供默认命令或默认参数 | 定义容器的主进程 |
| 组合使用 | CMD 作为 ENTRYPOINT 的默认参数 | ENTRYPOINT 固定命令 |

```dockerfile
# 推荐组合：ENTRYPOINT 定主进程，CMD 提供默认参数
ENTRYPOINT ["nginx"]
CMD ["-g", "daemon off;"]

# docker run myimage              → nginx -g "daemon off;"（使用 CMD 默认参数）
# docker run myimage -t           → nginx -t（CMD 被覆盖，执行配置测试）
```

---

## Q: 什么是多阶段构建（Multi-stage Build）？有什么好处？

**A:**

多阶段构建允许在一个 Dockerfile 中使用多个 `FROM`，每个阶段独立，**最终镜像只包含最后阶段的内容**，大幅减小镜像体积：

```dockerfile
# ── 阶段一：构建（包含完整开发工具） ──
FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build        # 构建产物在 /app/dist

# ── 阶段二：运行（只包含 Nginx + 静态文件）──
FROM nginx:alpine        # 基础镜像仅 ~7MB
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
```

| 对比项 | 单阶段构建 | 多阶段构建 |
|--------|----------|----------|
| 镜像包含内容 | node_modules + 源码 + 构建工具 | 仅最终产物 |
| 镜像大小（示例） | ~1.2GB | ~25MB |
| 攻击面 | 大（含构建工具） | 小 |

---

## Q: 什么是镜像分层（Layer）？有什么意义？

**A:**

Docker 镜像由多个**只读层（Layer）**叠加组成，每一条 `RUN`、`COPY`、`ADD` 指令都会创建一个新层。

**意义：**
1. **缓存复用**：层不变时直接复用缓存，加快构建速度
2. **共享存储**：多个镜像共享相同的底层，节省磁盘空间
3. **增量分发**：push/pull 时只传输变化的层

```dockerfile
# ❌ 不合理写法：每次源码变动都要重新安装所有依赖
COPY . .
RUN npm ci

# ✅ 合理写法：先复制 package 文件，依赖层不变时直接复用缓存
COPY package.json package-lock.json ./
RUN npm ci          # 此层被缓存
COPY . .            # 源码变动只影响这层之后
```

---

## 容器操作篇

## Q: Docker 常用命令速查

**A:**

**镜像操作：**
```bash
docker pull nginx:alpine          # 拉取镜像
docker images                     # 列出本地镜像
docker build -t myapp:1.0 .       # 构建镜像（当前目录 Dockerfile）
docker push myapp:1.0             # 推送镜像到仓库
docker rmi myapp:1.0              # 删除镜像
docker image prune                # 清理无用镜像
```

**容器操作：**
```bash
docker run -d -p 8080:80 --name web nginx   # 后台启动容器，端口映射 宿主:容器
docker run -it ubuntu bash                   # 交互式进入容器
docker ps                                    # 查看运行中的容器
docker ps -a                                 # 查看所有容器（含停止的）
docker stop web                              # 停止容器
docker start web                             # 启动已停止的容器
docker rm web                                # 删除容器
docker logs -f web                           # 实时查看容器日志
docker exec -it web sh                       # 进入运行中的容器
docker inspect web                           # 查看容器详细信息
docker stats                                 # 实时查看容器资源使用
```

**系统清理：**
```bash
docker system prune -a    # 清理所有无用的镜像、容器、网络（谨慎使用）
docker volume prune       # 清理无用数据卷
```

---

## Q: `docker run` 的常用参数有哪些？

**A:**

```bash
docker run \
  -d \                          # 后台运行（detached）
  -p 8080:80 \                  # 端口映射：宿主机端口:容器端口
  -v /host/data:/app/data \     # 目录挂载：宿主机路径:容器路径
  -e NODE_ENV=production \      # 设置环境变量
  --name my-app \               # 指定容器名称
  --restart unless-stopped \    # 重启策略：always / on-failure / unless-stopped
  --memory 512m \               # 限制内存（cgroups）
  --cpus 1 \                    # 限制 CPU 核数
  --network my-network \        # 指定网络
  myapp:1.0                     # 镜像名:标签
```

---

## 网络篇

## Q: Docker 网络模式有哪些？

**A:**

| 网络模式 | 特点 | 适用场景 |
|---------|------|---------|
| **bridge（默认）** | 容器通过虚拟网桥通信，与宿主机网络隔离 | 单机多容器通信 |
| **host** | 容器直接使用宿主机网络（无隔离） | 高性能网络场景 |
| **none** | 完全隔离，无网络 | 无需网络的任务型容器 |
| **overlay** | 跨多台宿主机的容器通信（Docker Swarm / K8s） | 多机集群 |
| **自定义 bridge** | 同一自定义网络内的容器可通过容器名互相访问 | **多容器项目推荐** |

```bash
# 创建自定义网络
docker network create my-net

# 启动容器并加入网络
docker run -d --name db --network my-net postgres
docker run -d --name app --network my-net myapp

# app 容器内可直接用容器名访问数据库
# 如：postgresql://db:5432/mydb （无需知道 IP）
```

---

## 数据持久化篇

## Q: Docker 数据持久化有哪几种方式？如何选择？

**A:**

容器删除后，容器内的数据默认丢失，需要通过以下方式持久化：

| 方式 | 说明 | 适用场景 |
|------|------|---------|
| **Volume（数据卷）** | Docker 管理的存储，数据存在宿主机 `/var/lib/docker/volumes/` | 数据库、生产环境持久化（推荐） |
| **Bind Mount（目录挂载）** | 将宿主机指定目录挂载到容器 | 开发时挂载源码实现热更新 |
| **tmpfs Mount** | 数据存储在内存（重启丢失） | 临时敏感数据（不落磁盘） |

```bash
# Volume（推荐用于生产）
docker run -v my-data:/app/data myapp   # Docker 管理 my-data
docker volume ls                         # 查看所有 volume
docker volume inspect my-data

# Bind Mount（推荐用于开发）
docker run -v $(pwd)/src:/app/src myapp  # 宿主机目录挂载（代码热更新）
```

---

## Docker Compose 篇

## Q: Docker Compose 是什么？解决什么问题？

**A:**

**Docker Compose** 是用于定义和运行**多容器 Docker 应用**的工具，通过 `docker-compose.yml` 文件声明所有服务、网络、卷的配置，一条命令启动整个应用栈。

**解决的问题：**
- 手动 `docker run` 多个容器，参数繁琐且难以维护
- 多容器之间的依赖关系、网络配置管理复杂

**一个典型的前端全栈项目 compose 文件：**

```yaml
# docker-compose.yml
version: '3.9'

services:
  # 前端
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:80"
    depends_on:
      - backend
    networks:
      - app-net

  # 后端 API
  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      DATABASE_URL: postgresql://postgres:secret@db:5432/mydb
      NODE_ENV: production
    depends_on:
      db:
        condition: service_healthy   # 等待 db 健康检查通过
    networks:
      - app-net

  # 数据库
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: mydb
      POSTGRES_PASSWORD: secret
    volumes:
      - pgdata:/var/lib/postgresql/data  # 数据持久化
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - app-net

  # 缓存
  redis:
    image: redis:7-alpine
    networks:
      - app-net

volumes:
  pgdata:   # 声明具名 Volume

networks:
  app-net:  # 声明自定义网络（所有服务共享，可通过服务名互访）
```

```bash
docker compose up -d          # 后台启动所有服务
docker compose down           # 停止并删除容器（保留 volume）
docker compose down -v        # 同时删除 volume（⚠️ 数据会丢失）
docker compose logs -f        # 查看所有服务日志
docker compose ps             # 查看服务状态
docker compose exec backend sh # 进入 backend 容器
docker compose build          # 重新构建镜像
```

---

## Q: Docker Compose 中 `depends_on` 能保证服务启动顺序吗？

**A:**

`depends_on` 只保证**容器启动顺序**，**不保证服务就绪**（容器启动 ≠ 服务可以接受请求）。

```yaml
# ❌ 问题：db 容器启动了，但 PostgreSQL 进程可能还未就绪
backend:
  depends_on:
    - db

# ✅ 解法一：加 healthcheck（Docker Compose v3.9+）
backend:
  depends_on:
    db:
      condition: service_healthy  # 等待 healthcheck 通过

# ✅ 解法二：在应用代码中加重试逻辑（推荐，更健壮）
# backend 启动时如果数据库连接失败，自动重试 N 次
```

---

## 安全与最佳实践篇

## Q: 编写 Dockerfile 有哪些最佳实践？

**A:**

**1. 使用明确的版本标签，避免 `latest`**
```dockerfile
# ❌ 不确定版本，可能引入 breaking change
FROM node:latest

# ✅ 固定版本
FROM node:20.12-alpine
```

**2. 最小化镜像（用 alpine 或 distroless）**
```dockerfile
FROM node:20-alpine  # ~180MB
# vs
FROM node:20        # ~1.1GB
```

**3. 非 root 用户运行（安全）**
```dockerfile
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser   # 切换到非 root 用户
```

**4. 合理利用构建缓存（依赖先于源码）**
```dockerfile
COPY package.json package-lock.json ./
RUN npm ci               # 缓存层（依赖不变时不重跑）
COPY . .                 # 源码层（源码变化不影响上面的缓存）
```

**5. 使用 `.dockerignore` 排除无用文件**
```
# .dockerignore
node_modules
.git
.env
dist
*.log
```

**6. 一个容器只运行一个进程**
- 便于日志收集、健康检查、水平扩展

**7. 不在镜像中存储 Secrets**
```dockerfile
# ❌ 错误：密钥写进镜像层，git 历史也有记录
RUN export DB_PASSWORD=secret123 && ...

# ✅ 通过 docker run -e 或 Secrets 管理工具注入
```

---

## Q: 如何查看镜像体积并进行优化？

**A:**

```bash
# 查看镜像大小
docker images myapp

# 查看每一层的大小（分析哪层最大）
docker history myapp:latest

# 使用 dive 工具深入分析（第三方）
docker run --rm -it \
  -v /var/run/docker.sock:/var/run/docker.sock \
  wagoodman/dive:latest myapp:latest
```

**常见体积优化手段：**

```dockerfile
# 1. 合并 RUN 命令，减少层数，并清理缓存
RUN apt-get update && \
    apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/*   # 删除 apt 缓存

# 2. 只安装生产依赖
RUN npm ci --only=production

# 3. 多阶段构建（最有效）
FROM node:20 AS builder
# ... 构建过程 ...

FROM node:20-alpine
COPY --from=builder /app/dist ./dist
```

---

## 实战场景篇

## Q: 如何用 Docker 搭建本地前端开发环境（支持热更新）？

**A:**

```yaml
# docker-compose.dev.yml
services:
  frontend:
    image: node:20-alpine
    working_dir: /app
    volumes:
      - .:/app                     # 挂载源码（实现热更新）
      - /app/node_modules          # 匿名卷隔离 node_modules（避免宿主机和容器混用）
    ports:
      - "5173:5173"
    command: sh -c "npm install && npm run dev -- --host 0.0.0.0"
    environment:
      - VITE_API_URL=http://backend:8080
```

```bash
docker compose -f docker-compose.dev.yml up
```

> ⚠️ **注意**：`/app/node_modules` 使用匿名卷覆盖，防止宿主机的 `node_modules`（可能是 Windows 路径）覆盖容器内正确编译的版本。

---

## Q: Docker 容器健康检查怎么配置？

**A:**

健康检查让 Docker / K8s 知道容器是否真正可以对外提供服务：

```dockerfile
# Dockerfile 中定义
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1
```

```yaml
# docker-compose.yml 中定义（会覆盖 Dockerfile 中的配置）
services:
  backend:
    image: myapp
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s     # 检查间隔
      timeout: 5s       # 单次超时
      start_period: 10s # 启动缓冲期（期间失败不计入重试次数）
      retries: 3        # 连续失败 N 次后标记为 unhealthy
```

```bash
# 查看健康状态
docker inspect --format='{{.State.Health.Status}}' my-container
# healthy / unhealthy / starting
```
