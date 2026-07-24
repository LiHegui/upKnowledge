# MySQL

## 基础概念篇

## Q: MySQL 的存储引擎 InnoDB 和 MyISAM 有什么区别？

**A:**

| 维度 | InnoDB | MyISAM |
|------|--------|--------|
| 事务支持 | ✅ 支持 ACID | ❌ 不支持 |
| 外键 | ✅ 支持 | ❌ 不支持 |
| 行级锁 | ✅（并发写性能好）| ❌ 表级锁 |
| 崩溃恢复 | ✅ redo log 保证安全 | ❌ 需手动修复 |
| 全文索引 | MySQL 5.6+ 支持 | ✅ 原生支持 |
| 读性能 | 略低（有事务开销）| 略高（无事务）|
| 适用场景 | **绝大多数业务（默认选择）** | 日志、只读统计表 |

> ⚠️ **注意**：MySQL 8.0 起 InnoDB 已完全替代 MyISAM，新项目统一使用 InnoDB。

---

## Q: 什么是 ACID？InnoDB 如何保证 ACID？

**A:**

| 特性 | 含义 | InnoDB 实现机制 |
|------|------|----------------|
| **A — 原子性（Atomicity）** | 事务要么全部成功，要么全部回滚 | `undo log`：记录操作前的数据，回滚时恢复 |
| **C — 一致性（Consistency）** | 事务前后数据满足业务约束 | 原子性 + 隔离性 + 持久性共同保证 |
| **I — 隔离性（Isolation）** | 并发事务互不干扰 | `MVCC` + 锁机制 |
| **D — 持久性（Durability）** | 提交后数据永久保存，不因崩溃丢失 | `redo log`：事务提交时先写日志（WAL），崩溃后可重放 |

---

## 索引篇

## Q: MySQL 索引的数据结构是什么？为什么用 B+ 树而不用其他结构？

**A:**

InnoDB 使用 **B+ 树**作为索引数据结构。

| 结构 | 缺点（不适合数据库索引的原因）|
|------|-------------------------------|
| 哈希表 | 不支持范围查询、排序，无法利用索引前缀 |
| 二叉搜索树 | 最坏情况退化为链表（O(n)），树高不可控 |
| B 树（多叉平衡）| 内部节点也存数据，导致单个磁盘页节点数少，树更高 |
| **B+ 树** | ✅ 所有数据在叶子节点，内部节点只存 key；叶子节点串成链表支持范围查询；树高稳定（约 3 层可存千万行）|

**B+ 树的优势：**
- 磁盘 I/O 次数少（一次查询通常 3 次 I/O）
- 叶子节点链表天然支持范围扫描（`BETWEEN`、`ORDER BY`）
- 数据全在叶子节点，查询性能稳定

---

## Q: 聚簇索引和非聚簇索引（二级索引）有什么区别？

**A:**

**聚簇索引（Clustered Index）：**
- 叶子节点直接存储**完整行数据**
- InnoDB 每张表**有且只有一个**聚簇索引（通常是主键）
- 没有显式主键时，InnoDB 自动选择唯一非空列或生成隐藏 rowid

**非聚簇索引（Secondary Index / 二级索引）：**
- 叶子节点存储**索引列值 + 主键值**
- 查询时先找到主键，再回聚簇索引取完整行 → **回表**

```
聚簇索引（主键索引）：              二级索引（name 字段）：
B+树叶子节点：                     B+树叶子节点：
┌──────────────────────┐           ┌─────────────┐
│ pk=1 | name | age | ...│          │ name='Alice' │──▶ pk=1 ──▶ 回表
│ pk=2 | name | age | ...│          │ name='Bob'   │──▶ pk=2 ──▶ 回表
└──────────────────────┘           └─────────────┘
```

**覆盖索引（避免回表）：**
查询字段全部包含在索引中，无需回表：
```sql
-- 对 (name, age) 建联合索引
-- 以下查询可直接从索引获取数据，无需回表
SELECT name, age FROM users WHERE name = 'Alice';
```

---

## Q: 联合索引的最左前缀原则是什么？

**A:**

联合索引 `(a, b, c)` 的 B+ 树按 `a → b → c` 的顺序排序，查询必须**从最左列开始，不能跳过**：

| 查询条件 | 能否使用索引 | 说明 |
|---------|------------|------|
| `WHERE a = 1` | ✅ | 命中 a |
| `WHERE a = 1 AND b = 2` | ✅ | 命中 a、b |
| `WHERE a = 1 AND b = 2 AND c = 3` | ✅ | 全部命中 |
| `WHERE b = 2` | ❌ | 跳过 a，无法利用索引 |
| `WHERE a = 1 AND c = 3` | ⚠️ 部分 | 只命中 a，c 无法用索引 |
| `WHERE a = 1 AND b > 2 AND c = 3` | ⚠️ 部分 | a、b 命中，b 用范围后 c 失效 |

```sql
-- 建索引
CREATE INDEX idx_abc ON users(a, b, c);

-- ✅ 走索引
EXPLAIN SELECT * FROM users WHERE a = 1 AND b = 2;

-- ❌ 不走索引（跳过 a）
EXPLAIN SELECT * FROM users WHERE b = 2 AND c = 3;
```

---

## Q: 索引失效的常见场景有哪些？

**A:**

```sql
-- 1. 对索引列使用函数或运算
SELECT * FROM users WHERE YEAR(created_at) = 2024;  -- ❌ 函数导致失效
SELECT * FROM users WHERE created_at >= '2024-01-01'; -- ✅ 改为范围查询

-- 2. 隐式类型转换（字符串索引列用数字查询）
-- phone 列是 VARCHAR，用整数查询会触发类型转换
SELECT * FROM users WHERE phone = 13800138000;   -- ❌
SELECT * FROM users WHERE phone = '13800138000'; -- ✅

-- 3. LIKE 以通配符开头
SELECT * FROM users WHERE name LIKE '%Alice';   -- ❌ 前缀不确定
SELECT * FROM users WHERE name LIKE 'Alice%';   -- ✅

-- 4. OR 条件中有一侧无索引
SELECT * FROM users WHERE id = 1 OR age = 25;   -- ❌ age 无索引时全表扫描

-- 5. NOT IN / NOT EXISTS（某些情况下优化器选择全表扫描）
-- 6. 联合索引不满足最左前缀
-- 7. 索引列上使用 != 或 <>（优化器可能放弃索引）
```

---

## 事务与锁篇

## Q: MySQL 事务的四种隔离级别是什么？各自解决了哪些问题？

**A:**

| 隔离级别 | 脏读 | 不可重复读 | 幻读 | 说明 |
|---------|------|----------|------|------|
| **READ UNCOMMITTED** | ❌ 存在 | ❌ 存在 | ❌ 存在 | 可以读到未提交的数据，几乎不用 |
| **READ COMMITTED** | ✅ 解决 | ❌ 存在 | ❌ 存在 | Oracle 默认级别，每次读最新快照 |
| **REPEATABLE READ** | ✅ 解决 | ✅ 解决 | ⚠️ 部分 | **MySQL 默认**，同一事务内读取一致，InnoDB 用 MVCC+Gap Lock 解决幻读 |
| **SERIALIZABLE** | ✅ 解决 | ✅ 解决 | ✅ 解决 | 完全串行，性能最差 |

**三种读异常：**
- **脏读**：读到其他事务未提交的数据
- **不可重复读**：同一事务内两次读同一行，结果不同（其他事务 UPDATE 了）
- **幻读**：同一事务内两次范围查询，行数不同（其他事务 INSERT 了）

```sql
-- 查看当前隔离级别
SELECT @@transaction_isolation;

-- 设置隔离级别
SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ;
```

---

## Q: MVCC 是什么？InnoDB 如何实现？

**A:**

**MVCC（Multi-Version Concurrency Control，多版本并发控制）** 通过保存数据的多个历史版本，使读操作无需加锁，实现读写并发不阻塞。

**InnoDB 实现原理：**

1. **隐藏字段**：每行数据有两个隐藏字段：
   - `trx_id`：最后修改该行的事务 ID
   - `roll_pointer`：指向 undo log 链（历史版本链）

2. **Read View**：事务开启时生成快照，记录当前活跃（未提交）的事务 ID 列表
   - 读到的数据版本 `trx_id < 最小活跃事务ID` → 已提交，可见
   - 读到的数据版本在活跃列表中 → 未提交，沿 undo log 链找旧版本

3. **快照读 vs 当前读**：
   - `SELECT`（快照读）：读 MVCC 历史版本，不加锁
   - `SELECT ... FOR UPDATE` / `UPDATE` / `DELETE`（当前读）：读最新版本，加锁

---

## Q: MySQL 中有哪些锁？行锁的类型有哪些？

**A:**

**按粒度分：**
- **表级锁**：开销小，并发低（MyISAM 使用）
- **行级锁**：开销大，并发高（InnoDB 使用）
- **页级锁**：介于两者之间（BDB 引擎，已淘汰）

**InnoDB 行锁类型：**

| 锁类型 | 说明 | 触发场景 |
|--------|------|---------|
| **Record Lock（记录锁）** | 锁住索引上的某一条记录 | `WHERE id = 1 FOR UPDATE` |
| **Gap Lock（间隙锁）** | 锁住两条记录之间的间隙（不含记录本身）| 防止幻读，RR 隔离级别下范围查询 |
| **Next-Key Lock** | 记录锁 + 间隙锁（锁记录及其前面的间隙）| RR 级别下默认行锁形式 |
| **Insert Intention Lock（插入意向锁）** | 插入前申请的间隙锁，多个插入可并存 | INSERT 操作 |

```sql
-- 间隙锁示例：表中有 id = 3, 7, 10
-- 以下语句会锁住 (3, 7) 的间隙，防止其他事务在此范围插入
SELECT * FROM t WHERE id > 3 AND id < 7 FOR UPDATE;
```

---

## Q: 什么是死锁？如何避免？

**A:**

**死锁**：两个事务互相持有对方需要的锁，陷入永久等待。

```
事务 A：锁住 id=1，等待 id=2
事务 B：锁住 id=2，等待 id=1
→ 死锁
```

**InnoDB 的处理：** 自动检测死锁，选择代价小的事务回滚（通过 `innodb_deadlock_detect`）

**避免死锁的方法：**

1. **统一加锁顺序**：所有事务按相同顺序访问资源（如都按主键升序操作）
2. **减小事务粒度**：事务尽量短小，快速提交/回滚
3. **使用索引**：避免全表扫描导致大范围加锁
4. **设置锁超时**：`innodb_lock_wait_timeout = 50`（秒）

```sql
-- 查看最近一次死锁信息
SHOW ENGINE INNODB STATUS\G
```

---

## 查询优化篇

## Q: EXPLAIN 执行计划怎么看？

**A:**

```sql
EXPLAIN SELECT * FROM users WHERE name = 'Alice' AND age > 20;
```

**关键字段说明：**

| 字段 | 含义 | 关注点 |
|------|------|--------|
| `type` | 访问类型（**最重要**）| 从优到劣：`system > const > eq_ref > ref > range > index > ALL` |
| `key` | 实际使用的索引 | `NULL` 表示未走索引 |
| `rows` | 预估扫描行数 | 越小越好 |
| `Extra` | 额外信息 | 出现 `Using filesort`、`Using temporary` 需优化 |
| `possible_keys` | 可能用到的索引 | — |

**type 级别说明：**
- `const`：主键或唯一索引等值查询，最优
- `ref`：非唯一索引等值查询
- `range`：范围查询（BETWEEN、>、<、IN）
- `index`：全索引扫描（比 ALL 好，因为索引更小）
- `ALL`：全表扫描，**需要优化**

---

## Q: 慢查询如何定位和优化？

**A:**

**Step 1：开启慢查询日志**
```sql
SET GLOBAL slow_query_log = ON;
SET GLOBAL long_query_time = 1;  -- 超过 1 秒记录
SHOW VARIABLES LIKE 'slow_query_log_file'; -- 查看日志文件路径
```

**Step 2：分析慢查询**
```bash
# 使用 mysqldumpslow 工具分析
mysqldumpslow -s t -t 10 /path/to/slow.log   # 按时间排序，取前 10
```

**Step 3：EXPLAIN 分析执行计划**（见上题）

**常见优化手段：**

```sql
-- 1. 添加合适索引
ALTER TABLE users ADD INDEX idx_name_age (name, age);

-- 2. 避免 SELECT *，只查需要的列（减少网络传输 + 可利用覆盖索引）
SELECT id, name FROM users WHERE name = 'Alice';

-- 3. 大数据量分页优化（避免深分页）
-- ❌ 深分页，需扫描 100010 行
SELECT * FROM users ORDER BY id LIMIT 100000, 10;
-- ✅ 使用子查询定位起始 ID
SELECT * FROM users WHERE id > (
  SELECT id FROM users ORDER BY id LIMIT 100000, 1
) LIMIT 10;

-- 4. 使用 UNION ALL 替代 UNION（UNION 有去重开销）
-- 5. 小表驱动大表（JOIN 时让小结果集在外层）
```

---

## 日志篇

## Q: MySQL 中有哪些重要的日志？各自作用是什么？

**A:**

| 日志 | 归属 | 作用 |
|------|------|------|
| **undo log** | InnoDB 引擎层 | 记录数据修改前的值，用于**回滚事务**和 **MVCC** |
| **redo log** | InnoDB 引擎层 | 记录物理修改（页级），用于**崩溃恢复**，保证持久性（WAL 机制）|
| **binlog** | MySQL Server 层 | 记录所有 DDL + DML 操作（逻辑日志），用于**主从复制**和**数据恢复** |
| **relay log** | MySQL 从库 | 主从复制时，从库接收主库 binlog 后写入的中继日志 |
| **error log** | MySQL Server 层 | 记录启动/停止/运行错误信息 |

**redo log vs binlog 的区别：**

| 维度 | redo log | binlog |
|------|----------|--------|
| 归属 | InnoDB 独有 | Server 层，所有引擎共用 |
| 日志类型 | 物理日志（记录页的修改） | 逻辑日志（记录 SQL 或行变化）|
| 大小 | 固定大小，循环覆盖 | 追加写，可配置保留策略 |
| 用途 | 崩溃恢复 | 主从复制、按时间点恢复 |

**两阶段提交（保证 redo log 与 binlog 一致性）：**
```
1. InnoDB 写 redo log（prepare 状态）
2. Server 层写 binlog
3. InnoDB 提交 redo log（commit 状态）
```

---

## 高可用篇

## Q: MySQL 主从复制的原理是什么？

**A:**

```
主库（Master）                       从库（Slave）
┌──────────────────┐                ┌──────────────────────┐
│ 执行写操作        │                │  IO Thread           │
│    ↓              │  binlog        │  监听主库 binlog 变化 │
│ 写入 binlog      │ ─────────────▶ │  写入 relay log       │
└──────────────────┘                │    ↓                  │
                                    │  SQL Thread           │
                                    │  重放 relay log        │
                                    │  更新从库数据          │
                                    └──────────────────────┘
```

**复制模式：**

| 模式 | 说明 | 数据安全性 | 性能 |
|------|------|----------|------|
| **异步复制**（默认） | 主库提交后不等从库确认 | 低（主库宕机可能丢数据）| 高 |
| **半同步复制** | 至少等一个从库写入 relay log 后才返回 | 中 | 中 |
| **全同步复制** | 等所有从库执行完 | 高 | 低 |

**常见使用场景：**
- 读写分离（写主库，读从库）
- 数据备份（从库做备份不影响主库）
- 高可用（主库故障后从库升主）
