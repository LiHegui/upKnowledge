# Redis 速通

## 基础概念篇

## Q: Redis 是什么？有哪些核心特点？

**A:**

**Redis**（Remote Dictionary Server）是一个基于内存的高性能键值存储系统，支持多种数据结构，常用于缓存、消息队列、分布式锁等场景。

**核心特点：**

| 特点 | 说明 |
|------|------|
| **纯内存存储** | 读写速度达 10 万 QPS 级别 |
| **单线程命令处理** | 避免锁竞争，命令原子性天然保证（6.0 后 I/O 多线程，命令仍单线程）|
| **丰富的数据结构** | String / Hash / List / Set / ZSet 及扩展类型 |
| **持久化** | RDB 快照 + AOF 日志，数据不因重启丢失 |
| **高可用** | 主从复制、哨兵（Sentinel）、集群（Cluster）|
| **原子操作** | 支持 Lua 脚本、事务（MULTI/EXEC）|

---

## 五大数据结构篇

## Q: Redis 五大数据结构的底层实现和典型使用场景？

**A:**

### String（字符串）
- **底层**：SDS（Simple Dynamic String），动态字符串
- **特点**：最大存储 512 MB，支持自增/自减
- **场景**：缓存 JSON 对象、计数器（PV/UV）、分布式 Session、限流（INCR + EXPIRE）

```bash
SET user:1 '{"name":"Alice","age":25}'  EX 3600  # 带过期时间
INCR page:views                                   # 原子自增
SETNX lock:order 1                                # 不存在才设置（分布式锁原语）
```

### Hash（哈希）
- **底层**：小数据量用 listpack，大数据量用 hashtable
- **场景**：存储对象字段（比 JSON 字符串更灵活，可单字段更新）

```bash
HSET user:1 name Alice age 25 city Beijing
HGET user:1 name          # 获取单字段
HINCRBY user:1 age 1      # 字段自增
```

### List（列表）
- **底层**：小数据量用 listpack，大数据量用 quicklist（多个 ziplist 组成的双向链表）
- **场景**：消息队列（LPUSH + BRPOP）、时间线、最新 N 条记录

```bash
LPUSH queue:task task1 task2    # 左端入队
BRPOP queue:task 30             # 阻塞右端出队（等待 30 秒）
LRANGE news:latest 0 9          # 获取最新 10 条
```

### Set（集合）
- **底层**：小数据量用 listpack，大数据量用 hashtable
- **特点**：无序、不重复
- **场景**：去重（如用户签到记录）、共同好友（SINTER 交集）、随机抽奖（SRANDMEMBER）

```bash
SADD user:1:follows 2 3 4       # 用户 1 关注了 2 3 4
SADD user:2:follows 1 3 5
SINTER user:1:follows user:2:follows  # 共同关注：{3}
SRANDMEMBER lottery:pool 3      # 随机抽 3 人
```

### ZSet（有序集合）
- **底层**：小数据量用 listpack，大数据量用 skiplist（跳表）+ hashtable
- **特点**：每个元素有 score 分值，按 score 排序
- **场景**：排行榜、延迟队列（score 存时间戳）

```bash
ZADD leaderboard 9527 Alice 8888 Bob 9999 Charlie
ZREVRANGE leaderboard 0 2 WITHSCORES  # 前三名（降序）
ZRANGEBYSCORE delay:queue 0 1716300000  # 取出 score ≤ 当前时间的任务（延迟队列）
```

---

## Q: Redis 为什么这么快？单线程如何应对高并发？

**A:**

**快的原因：**
1. **纯内存操作**：不涉及磁盘 I/O，读写速度在纳秒级
2. **I/O 多路复用**：单线程用 epoll 监听大量连接，不阻塞
3. **高效的数据结构**：针对不同场景选择最优底层结构（如跳表、SDS）
4. **协议简单**：RESP 协议解析代价极低

**单线程如何应对高并发：**

```
多个客户端连接
      │
      ▼
  epoll 事件循环（I/O 多路复用）
      │
      ├── 连接 1 可读 → 读命令
      ├── 连接 2 可读 → 读命令
      └── 连接 N 可读 → 读命令
      │
      ▼
  命令队列（串行执行）
      │
      ▼
  结果返回各客户端
```

单线程串行执行命令，天然避免了多线程锁竞争，保证命令原子性。每条命令执行时间极短（微秒级），整体吞吐量依然很高。

> ⚠️ **注意**：Redis 6.0 引入多线程处理**网络 I/O**，但命令的**执行仍是单线程**，避免了并发问题。

---

## 持久化篇

## Q: RDB 和 AOF 持久化有什么区别？如何选择？

**A:**

| 维度 | RDB（快照）| AOF（追加日志）|
|------|-----------|--------------|
| 机制 | 定时将内存数据写成二进制快照文件 | 记录每条写命令，追加到 AOF 文件 |
| 文件大小 | 小（压缩二进制）| 大（文本命令）|
| 恢复速度 | 快（直接加载快照）| 慢（需重放所有命令）|
| 数据安全 | 低（两次快照间的数据可能丢失）| 高（最多丢失 1 秒数据，取决于 fsync 策略）|
| 性能影响 | fork 子进程，可能有短暂卡顿 | 持续追加写，影响小 |
| 适用场景 | 允许少量数据丢失，追求快速恢复 | 对数据安全要求高 |

**AOF 三种 fsync 策略：**

```bash
# redis.conf
appendfsync always    # 每条命令都 fsync（最安全，最慢）
appendfsync everysec  # 每秒 fsync（推荐，最多丢 1 秒数据）
appendfsync no        # 由 OS 决定（最快，可能丢更多）
```

**混合持久化（Redis 4.0+，推荐）：**

AOF 重写时，将当前数据以 RDB 格式写入 AOF 文件开头，后续追加增量 AOF 命令。兼顾恢复速度和数据安全。

```bash
aof-use-rdb-preamble yes  # 开启混合持久化
```

---

## 过期与淘汰篇

## Q: Redis 的过期键删除策略是什么？

**A:**

Redis 使用两种策略组合处理过期键：

**1. 惰性删除（Lazy Expiration）**
- 访问 key 时才检查是否过期，过期则删除
- 优点：CPU 开销小；缺点：过期 key 不及时清理，内存浪费

**2. 定期删除（Periodic Expiration）**
- 每隔一定时间（默认 100ms）随机抽取一批设置了过期时间的 key，删除已过期的
- 持续检查直到过期 key 比例低于 25%，避免 CPU 占用过高

---

## Q: Redis 内存淘汰策略有哪些？

**A:**

当内存达到 `maxmemory` 上限时，Redis 按配置的策略淘汰数据：

| 策略 | 说明 |
|------|------|
| `noeviction` | 不淘汰，写操作直接报错（默认值） |
| `allkeys-lru` | 从所有 key 中淘汰最近最少使用的 |
| `volatile-lru` | 只从设置了过期时间的 key 中淘汰 LRU |
| `allkeys-lfu` | 从所有 key 中淘汰使用频率最低的（LFU） |
| `volatile-lfu` | 只从设置了过期时间的 key 中淘汰 LFU |
| `allkeys-random` | 随机淘汰所有 key |
| `volatile-random` | 随机淘汰设置了过期时间的 key |
| `volatile-ttl` | 淘汰剩余 TTL 最短的 key |

**推荐策略：**
- 纯缓存场景 → `allkeys-lru`
- 缓存 + 持久化混用 → `volatile-lru`

---

## 缓存问题篇

## Q: 缓存穿透、缓存击穿、缓存雪崩是什么？如何解决？

**A:**

### 缓存穿透
**现象**：查询一个**数据库中不存在**的 key，每次都绕过缓存直达数据库。

```
恶意请求 id=-1 → Redis 未命中 → MySQL 未命中 → 返回空
                               ↑ 每次都打到 MySQL
```

**解决方案：**
```bash
# 方案一：缓存空值（简单，有时效性问题）
SET user:-1 "" EX 60   # 缓存空结果 60 秒

# 方案二：布隆过滤器（推荐大规模场景）
# 启动时将所有合法 id 加入布隆过滤器
# 请求先过布隆过滤器，不存在的 key 直接拦截
```

---

### 缓存击穿
**现象**：**热点 key 过期**的瞬间，大量并发请求同时穿透到数据库。

**解决方案：**
```bash
# 方案一：互斥锁（同一时刻只有一个请求重建缓存）
SET lock:user:1 1 NX EX 5  # NX=不存在才设置，EX=过期时间

# 方案二：热点数据不设过期时间（逻辑过期）
# 数据中存储过期时间字段，异步更新缓存，不影响读取
```

---

### 缓存雪崩
**现象**：**大量 key 同时过期**，或 Redis 宕机，导致请求全部打到数据库。

**解决方案：**
```bash
# 方案一：过期时间加随机抖动，避免集体到期
EXPIRE key $((3600 + RANDOM % 300))   # 3600 ± 300 秒随机

# 方案二：Redis 高可用（哨兵 / 集群），避免单点故障

# 方案三：限流熔断，数据库层加保护
# 方案四：二级缓存（本地缓存 + Redis 双层）
```

---

## 分布式锁篇

## Q: 如何用 Redis 实现分布式锁？有哪些注意事项？

**A:**

**基础实现（SET NX EX）：**

```bash
# 原子操作：只有 key 不存在时才设置，同时设置过期时间
SET lock:order:123 $random_value NX EX 30
# NX = Not eXists（不存在才设置，保证互斥）
# EX 30 = 30 秒后自动释放（防止持锁崩溃导致死锁）
# $random_value = 唯一标识（防止误释放其他进程的锁）
```

**释放锁必须用 Lua 脚本保证原子性：**

```lua
-- 检查 value 是自己的才删除（防误释放）
if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
else
    return 0
end
```

**常见问题：**

| 问题 | 原因 | 解决 |
|------|------|------|
| 锁过期业务未完成 | 超时时间设短了 | 看门狗机制（Redisson 自动续期）|
| 误释放他人的锁 | 未校验 value | 释放时检查唯一标识 |
| Redis 主从切换锁丢失 | 主库写入后还未同步从库就宕机 | 使用 Redlock 算法（多节点）|

**Redlock 算法（多节点 Redis）：**

在 N 个（通常 5 个）独立 Redis 节点上同时加锁，超过半数（N/2 + 1）成功才视为加锁成功，避免单节点故障导致锁失效。

---

## 高可用篇

## Q: Redis 主从复制、哨兵、集群三种模式的区别？

**A:**

| 模式 | 架构 | 解决的问题 | 局限 |
|------|------|----------|------|
| **主从复制** | 一主多从，从节点只读 | 读写分离、数据备份 | 主节点故障需手动切换 |
| **哨兵（Sentinel）** | 主从 + 多个哨兵进程监控 | 主节点故障自动选举新主（高可用）| 单主节点，写性能有上限 |
| **集群（Cluster）** | 多主多从，数据分片 | 水平扩展，支持超大数据量 | 跨 slot 的事务不支持，运维复杂 |

**Redis Cluster 数据分片原理：**

```
16384 个哈希槽（slot）均分到各主节点
key → CRC16(key) % 16384 → 确定 slot → 找到对应节点

例如 3 主节点：
节点 A：slot 0 ~ 5460
节点 B：slot 5461 ~ 10922
节点 C：slot 10923 ~ 16383
```

---

## Q: Redis 事务和 Lua 脚本有什么区别？

**A:**

| 维度 | MULTI/EXEC 事务 | Lua 脚本 |
|------|----------------|---------|
| 原子性 | ✅（命令队列一次执行）| ✅（脚本原子执行）|
| 错误回滚 | ❌ 运行时错误不回滚其他命令 | ❌ 同样不回滚 |
| 条件判断 | ❌ 不支持 | ✅ 支持 if/else 逻辑 |
| 性能 | 需多次网络往返 | 一次网络往返 |
| 适用场景 | 简单批量操作 | 需要条件判断的复杂原子操作 |

```bash
# 事务示例
MULTI
INCR stock:101
DECRBY balance:user1 100
EXEC

# Lua 脚本示例（扣减库存，判断库存 > 0 才执行）
EVAL "
  local stock = redis.call('get', KEYS[1])
  if tonumber(stock) > 0 then
    redis.call('decr', KEYS[1])
    return 1
  end
  return 0
" 1 stock:101
```

---

## 实战场景篇

## Q: Redis 如何实现排行榜？

**A:**

使用 **ZSet（有序集合）**，以分数作为 score：

```bash
# 用户得分
ZADD game:rank 9527 user:alice
ZADD game:rank 8888 user:bob
ZADD game:rank 9999 user:charlie

# 实时排名（降序）
ZREVRANK game:rank user:alice     # alice 的排名（0-based）

# 获取前 10 名及分数
ZREVRANGE game:rank 0 9 WITHSCORES

# 增加分数
ZINCRBY game:rank 100 user:alice  # alice +100 分
```

---

## Q: Redis 如何实现限流？

**A:**

**方案一：固定窗口（INCR + EXPIRE）**

```bash
# 每分钟最多 100 次请求
key = "limit:user:1:$(date +'%Y%m%d%H%M')"   # 按分钟分桶
count = INCR key
if count == 1:
    EXPIRE key 60    # 第一次请求时设置过期
if count > 100:
    return "限流"
```

**方案二：滑动窗口（ZSet）**

```bash
# 用 ZSet 记录请求时间戳，score 和 value 都用时间戳
now = current_timestamp_ms
window = 60000  # 60 秒窗口

ZREMRANGEBYSCORE key 0 (now - window)   # 删除窗口外的记录
count = ZCARD key
if count >= 100:
    return "限流"
ZADD key now now
EXPIRE key 60
```

**方案三：令牌桶 / 漏桶（推荐 Lua 脚本实现原子操作）**

> ⚠️ 生产环境推荐使用 **Redis + Lua** 保证原子性，或直接使用 Nginx 的 `limit_req` 模块。
