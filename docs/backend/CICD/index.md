# CI/CD

## 基础概念篇

## Q: 什么是 CI/CD？CI、CD（持续交付）、CD（持续部署）三者有何区别？

**A:**

| 阶段 | 全称 | 含义 |
|------|------|------|
| **CI** | Continuous Integration（持续集成） | 开发者频繁提交代码，自动触发：安装依赖 → 代码检查 → 测试 → 构建，尽早暴露问题 |
| **持续交付** | Continuous Delivery | CI 通过后，自动将构建产物部署到**预发布/测试环境**，发布到生产仍需人工确认 |
| **持续部署** | Continuous Deployment | 在持续交付的基础上进一步自动化，流水线通过即**自动发布到生产环境**，无需人工介入 |

```
代码提交
   │
   ▼
┌─────── CI ────────┐
│ 安装依赖           │
│ Lint + 类型检查    │
│ 单元测试           │
│ 构建              │
└───────────────────┘
   │ 通过
   ▼
┌─── 持续交付/部署 ──┐
│ 部署到测试环境     │
│ E2E 冒烟测试       │
│ [人工确认]→ 生产   │  ← 持续交付
│ [自动] → 生产      │  ← 持续部署
└───────────────────┘
```

> ⚠️ **注意**：大多数企业前端项目处于**持续交付**阶段（测试环境自动发布，生产需人工审批）。完全持续部署要求有高度成熟的自动化测试和监控体系。

---

## Q: CI/CD 的核心价值是什么？

**A:**

1. **快速反馈**：代码提交后分钟级发现问题，而非人工 Code Review 后数小时才发现编译失败
2. **消除人为失误**：构建、测试、部署步骤标准化，避免"手动操作漏步骤"的问题
3. **频繁小批量发布**：每次发布变更量小，问题更容易定位，降低发布风险
4. **质量门禁**：只有通过所有检查的代码才能合并 / 上线，保障代码库健康

---

## 核心工具篇

## Q: 常见 CI/CD 工具有哪些？如何选型？

**A:**

| 工具 | 托管方式 | 特点 | 适用场景 |
|------|---------|------|---------|
| **GitHub Actions** | 云托管（SaaS） | 与 GitHub 深度集成，市场有大量现成 Action | GitHub 托管的项目首选 |
| **GitLab CI/CD** | 云托管 / 自托管 | 内置在 GitLab 中，`.gitlab-ci.yml` 配置 | GitLab 仓库，企业自建 GitLab |
| **Jenkins** | 自托管 | 生态最成熟，插件丰富，但运维成本高 | 传统企业、复杂流水线 |
| **CircleCI** | 云托管 | 并行执行能力强，配置简洁 | 中小型团队 |
| **Tekton** | 自托管（K8s） | 云原生，基于 Kubernetes CRD | 云原生 / K8s 环境 |
| **ArgoCD** | 自托管（K8s） | GitOps 持续部署，专注 K8s 应用 | K8s 生产环境 CD |

**选型建议：**
- 代码托管在 GitHub → 优先 **GitHub Actions**
- 代码托管在 GitLab → 优先 **GitLab CI/CD**
- 需要高度定制化或已有 Jenkins 历史积累 → **Jenkins**
- K8s 环境部署 → **ArgoCD + Tekton**

---

## GitHub Actions 篇

## Q: GitHub Actions 的核心概念有哪些？

**A:**

| 概念 | 说明 |
|------|------|
| **Workflow（工作流）** | 定义在 `.github/workflows/*.yml`，是完整的自动化流程 |
| **Event（触发事件）** | 触发 Workflow 的事件，如 `push`、`pull_request`、`schedule`、`workflow_dispatch` |
| **Job（作业）** | Workflow 中的独立执行单元，默认并行执行，可通过 `needs` 设置依赖 |
| **Step（步骤）** | Job 中按顺序执行的最小单元，每个 Step 执行一个命令或调用一个 Action |
| **Action（动作）** | 可复用的 Step 封装，来自 GitHub Marketplace 或自定义 |
| **Runner（运行器）** | 执行 Job 的虚拟机环境，GitHub 提供 `ubuntu-latest`、`windows-latest`、`macos-latest` |

---

## Q: 写一个完整的前端 CI GitHub Actions 配置？

**A:**

```yaml
# .github/workflows/ci.yml
name: Frontend CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  ci:
    runs-on: ubuntu-latest

    steps:
      # 1. 拉取代码
      - name: Checkout code
        uses: actions/checkout@v4

      # 2. 设置 Node.js 并缓存依赖
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'  # 自动缓存 ~/.npm 目录

      # 3. 安装依赖（使用 ci 命令，严格按 lockfile 安装）
      - name: Install dependencies
        run: npm ci

      # 4. 代码检查
      - name: Lint
        run: npm run lint

      # 5. TypeScript 类型检查
      - name: Type check
        run: npm run typecheck

      # 6. 单元测试并生成覆盖率报告
      - name: Test
        run: npm run test -- --coverage

      # 7. 构建
      - name: Build
        run: npm run build

      # 8. 上传构建产物（可选，供后续 Job 使用）
      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/
          retention-days: 7
```

---

## Q: GitHub Actions 中如何管理环境变量和 Secrets？

**A:**

**Secrets（敏感信息）** 在 GitHub 仓库的 `Settings → Secrets and variables → Actions` 中配置，注入后在日志中自动脱敏：

```yaml
steps:
  - name: Deploy to server
    env:
      SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
      SERVER_HOST: ${{ secrets.SERVER_HOST }}
    run: |
      echo "$SSH_PRIVATE_KEY" > ~/.ssh/id_rsa
      chmod 600 ~/.ssh/id_rsa
      rsync -avz dist/ user@$SERVER_HOST:/var/www/app/
```

**Variables（非敏感配置）** 使用 `vars` 上下文：

```yaml
- name: Set environment
  run: echo "API_URL=${{ vars.API_URL }}" >> $GITHUB_ENV
```

**不同环境区分配置（Environments）：**

```yaml
jobs:
  deploy-prod:
    runs-on: ubuntu-latest
    environment: production  # 引用 GitHub Environment，可配置保护规则和审批人
    steps:
      - run: echo "Deploying to ${{ vars.DEPLOY_URL }}"
```

> ⚠️ **安全注意**：永远不要将 Token、密钥、密码硬编码在代码或 workflow 文件中；Fork 的 PR 默认无法访问 Secrets。

---

## Q: GitHub Actions 如何实现矩阵测试（matrix）？

**A:**

矩阵策略可以用一个 Job 定义，在多个环境组合下并行运行：

```yaml
jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest]
        node: [18, 20, 22]
      fail-fast: false  # 其中一个组合失败时，不取消其他组合

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
      - run: npm ci
      - run: npm test
```

上面的配置会产生 **2 × 3 = 6** 个并行 Job。

---

## GitLab CI 篇

## Q: GitLab CI 的 `.gitlab-ci.yml` 基本结构是什么？

**A:**

```yaml
# 定义阶段执行顺序（同阶段 Job 并行，不同阶段串行）
stages:
  - install
  - lint
  - test
  - build
  - deploy

# 全局变量
variables:
  NODE_VERSION: "20"
  CACHE_KEY: "$CI_COMMIT_REF_SLUG"

# 全局缓存（减少每次安装依赖时间）
cache:
  key: $CACHE_KEY
  paths:
    - node_modules/

# ── Job 定义 ──

install:
  stage: install
  image: node:20-alpine
  script:
    - npm ci
  artifacts:
    paths:
      - node_modules/
    expire_in: 1 hour

lint:
  stage: lint
  image: node:20-alpine
  script:
    - npm run lint
    - npm run typecheck

test:
  stage: test
  image: node:20-alpine
  script:
    - npm run test -- --coverage
  coverage: '/Lines\s*:\s*(\d+\.?\d*)%/'  # 提取覆盖率数值显示在 MR 页面

build:
  stage: build
  image: node:20-alpine
  script:
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 1 day

deploy-staging:
  stage: deploy
  script:
    - echo "部署到测试环境"
    - rsync -avz dist/ user@staging.example.com:/var/www/
  environment:
    name: staging
    url: https://staging.example.com
  only:
    - develop  # 只在 develop 分支触发

deploy-production:
  stage: deploy
  script:
    - echo "部署到生产环境"
  environment:
    name: production
    url: https://example.com
  when: manual       # 需要人工点击触发
  only:
    - main
```

---

## Q: GitLab CI 中 `only`/`except` 和 `rules` 有什么区别？

**A:**

`rules` 是 `only`/`except` 的升级替代，支持更复杂的条件逻辑，**推荐使用 `rules`**：

```yaml
# 旧写法（only/except）
deploy:
  only:
    - main
  except:
    - schedules

# 新写法（rules）—— 功能更强
deploy:
  rules:
    # MR 到 main 且不是定时任务时，需人工触发
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event" && $CI_MERGE_REQUEST_TARGET_BRANCH_NAME == "main"'
      when: manual
    # push 到 main 时自动触发
    - if: '$CI_COMMIT_BRANCH == "main"'
      when: on_success
    # 其他情况不触发
    - when: never
```

---

## 部署策略篇

## Q: 蓝绿部署、金丝雀发布、滚动发布有什么区别？

**A:**

| 策略 | 原理 | 优点 | 缺点 |
|------|------|------|------|
| **蓝绿部署** | 同时维护两套完全相同的环境（蓝/绿），流量通过负载均衡瞬间切换 | 回滚快（秒级切回旧版本） | 资源成本翻倍 |
| **金丝雀发布** | 先将少量流量（1%~5%）导入新版本，观察后逐步放量 | 风险可控，影响面小 | 需要流量控制能力，观测周期较长 |
| **滚动发布** | 逐步替换旧版本实例为新版本，每次替换部分节点 | 无需双倍资源，平滑升级 | 发布过程中存在新旧版本并存，需保证接口向后兼容 |

**前端静态资源部署常用方案：**

```
方案：全量发布 + 版本号回滚（最常见）

1. 构建产物带 commit hash（vite 默认：main.[hash].js）
2. 发布新版本不删除旧版本文件（保留 N 个历史版本）
3. 只替换入口 HTML（index.html 无 hash，短缓存）
4. 需要回滚时：将旧版本 HTML 重新指向旧 JS/CSS 即可
```

---

## Q: 如何在 CI/CD 中实现前端环境变量注入？

**A:**

前端构建时环境变量被编译进产物，常见注入方式：

**方式一：构建时注入（Vite 示例）**
```yaml
# CI 配置中设置环境变量
- name: Build
  env:
    VITE_API_URL: ${{ vars.API_URL }}
    VITE_ENV: production
  run: npm run build
```

```js
// 代码中读取（Vite 自动处理 import.meta.env）
const apiUrl = import.meta.env.VITE_API_URL;
```

**方式二：运行时注入（适合容器化部署）**
```dockerfile
# 通过 Nginx 配置文件模板 + envsubst
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
# 启动时 envsubst 将 $API_URL 替换为实际值
```

**方式三：runtime-config（最灵活）**
```html
<!-- index.html 中注入 window.__config -->
<script>
  window.__config = { apiUrl: '__API_URL__' };
</script>
```
```bash
# 部署脚本中替换占位符
sed -i "s|__API_URL__|${API_URL}|g" /var/www/index.html
```

---

## Docker 与容器化篇

## Q: 如何为前端项目编写 Dockerfile？

**A:**

**多阶段构建（推荐）**，最终镜像只包含 Nginx + 静态文件，体积小：

```dockerfile
# ── 阶段一：构建 ──
FROM node:20-alpine AS builder

WORKDIR /app

# 先复制 package 文件，利用 Docker 层缓存
COPY package.json package-lock.json ./
RUN npm ci

# 再复制源码并构建
COPY . .
RUN npm run build

# ── 阶段二：运行 ──
FROM nginx:alpine

# 复制构建产物到 Nginx 目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制自定义 Nginx 配置（处理 SPA history 路由等）
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```nginx
# nginx.conf — 处理 Vue/React 单页应用路由
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    # API 反向代理
    location /api/ {
        proxy_pass http://backend:3000/;
    }

    # SPA fallback：所有路由都返回 index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源长缓存
    location ~* \.(js|css|png|jpg|svg|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## Q: CI/CD 中如何构建并推送 Docker 镜像？

**A:**

```yaml
# GitHub Actions 示例：构建并推送到 GitHub Container Registry
name: Build and Push Docker Image

on:
  push:
    branches: [main]

jobs:
  docker:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write  # 推送到 GHCR 需要此权限

    steps:
      - uses: actions/checkout@v4

      # 登录到镜像仓库
      - name: Login to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      # 提取元信息（镜像标签）
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ghcr.io/${{ github.repository }}
          tags: |
            type=sha,prefix=commit-
            type=raw,value=latest,enable=${{ github.ref == 'refs/heads/main' }}

      # 构建并推送（使用 BuildKit 缓存）
      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          cache-from: type=gha    # 使用 GitHub Actions 缓存
          cache-to: type=gha,mode=max
```

---

## 质量门禁篇

## Q: CI 流程中应该包含哪些质量检查环节？

**A:**

```
代码提交
   │
   ├── 静态检查
   │     ├── ESLint（代码规范）
   │     ├── Prettier（格式化）
   │     ├── TypeScript tsc --noEmit（类型安全）
   │     └── commitlint（提交信息规范）
   │
   ├── 测试
   │     ├── 单元测试（Jest / Vitest）+ 覆盖率门禁
   │     └── E2E 冒烟测试（Playwright / Cypress）
   │
   ├── 构建检查
   │     ├── 构建是否成功
   │     ├── Bundle Size 阈值（bundlesize / size-limit）
   │     └── 依赖安全扫描（npm audit / Snyk）
   │
   └── 部署后验证
         ├── Lighthouse CI（性能/可访问性指标）
         └── 健康检查（HTTP 200 探活）
```

**Bundle Size 限制示例（size-limit）：**

```json
// package.json
{
  "size-limit": [
    {
      "path": "dist/assets/*.js",
      "limit": "250 kB"
    }
  ],
  "scripts": {
    "size": "size-limit"
  }
}
```

```yaml
# CI 中加入体积检查
- name: Check bundle size
  run: npm run size
```

---

## Q: 如何在 PR/MR 上展示 CI 检查状态和测试覆盖率？

**A:**

**测试覆盖率上报（Codecov 为例）：**

```yaml
- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v4
  with:
    token: ${{ secrets.CODECOV_TOKEN }}
    files: ./coverage/lcov.info
    fail_ci_if_error: true
```

**Lighthouse CI 集成：**

```yaml
- name: Run Lighthouse CI
  uses: treosh/lighthouse-ci-action@v11
  with:
    urls: |
      https://staging.example.com
    budgetPath: ./lighthouserc.json  # 配置性能阈值
    uploadArtifacts: true
```

```json
// lighthouserc.json
{
  "ci": {
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["warn", { "minScore": 0.9 }],
        "first-contentful-paint": ["error", { "maxNumericValue": 2000 }]
      }
    }
  }
}
```

---

## 缓存优化篇

## Q: 如何在 CI 中最大化利用缓存来提升构建速度？

**A:**

CI 构建慢的主要原因通常是**依赖安装**，以下是优化策略：

**GitHub Actions 依赖缓存：**

```yaml
- name: Setup Node with cache
  uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm'  # 自动缓存 ~/.npm，基于 package-lock.json hash

# 或手动控制（更精细）
- name: Cache node_modules
  uses: actions/cache@v4
  with:
    path: node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

**Docker 构建缓存（多阶段 + BuildKit）：**

```yaml
- uses: docker/build-push-action@v5
  with:
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

**Vite/Webpack 构建缓存：**

```yaml
- name: Cache Vite build cache
  uses: actions/cache@v4
  with:
    path: node_modules/.vite
    key: vite-${{ hashFiles('src/**', 'vite.config.*') }}
```

**最佳实践：**
- 将 `npm ci` 替换为带缓存的方式，可将安装时间从 2 分钟降到 10 秒
- 缓存 key 包含 lockfile hash，保证依赖变更时自动失效
- 拆分 Job，让测试和构建可以并行

---

## 安全篇

## Q: CI/CD 流程中有哪些常见的安全风险？如何防范？

**A:**

| 风险 | 描述 | 防范措施 |
|------|------|---------|
| **Secrets 泄漏** | 密钥被打印到日志或提交到代码库 | 使用平台 Secrets 功能；配置 `.gitignore`；开启 Secret Scanning |
| **供应链攻击** | 第三方依赖被注入恶意代码 | 锁定依赖版本（lockfile）；定期运行 `npm audit`；使用 Dependabot |
| **权限过大** | CI Runner 拥有不必要的权限 | 最小权限原则；GitHub Actions 明确声明 `permissions` |
| **恶意 PR** | Fork 的 PR 中修改 workflow 获取 Secrets | 要求 maintainer 审批才能运行 CI；Fork PR 不注入 Secrets |
| **镜像漏洞** | 基础镜像含已知 CVE 漏洞 | 使用 Trivy / Snyk 扫描镜像；定期更新基础镜像 |

```yaml
# GitHub Actions 最小权限声明（推荐）
permissions:
  contents: read      # 只读代码
  packages: write     # 推送镜像（按需开启）
  pull-requests: write # 评论 PR（按需开启）
```

```yaml
# 依赖安全扫描
- name: Security audit
  run: npm audit --audit-level=high
  # 发现 high/critical 级别漏洞时 CI 失败

# 镜像漏洞扫描
- name: Scan image with Trivy
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: 'myapp:latest'
    severity: 'CRITICAL,HIGH'
    exit-code: '1'
```

---

## Q: 什么是 GitOps？与传统 CD 有什么区别？

**A:**

**GitOps** 是一种以 **Git 仓库作为单一事实来源（Single Source of Truth）** 的运维模式，所有基础设施和应用配置都声明在 Git 中，自动化工具负责使实际状态与 Git 保持一致。

| 维度 | 传统 CD | GitOps |
|------|---------|--------|
| 触发方式 | CI 流水线主动推送（Push）到目标环境 | 运维工具持续拉取（Pull）Git 状态 |
| 配置存储 | 分散在脚本、环境变量中 | 全部声明在 Git 仓库 |
| 回滚方式 | 重新触发旧版本流水线 | `git revert` 即可触发自动回滚 |
| 审计追踪 | CI 日志 | Git 提交历史（天然审计） |
| 代表工具 | Jenkins、GitHub Actions | **ArgoCD**、Flux |

```
GitOps 工作流示意：

开发者 git push → Git 仓库（K8s manifest）
                        │
                   ArgoCD 持续监听
                        │
                        ▼
               K8s 集群（保持与 Git 一致）
```

> ⚠️ **注意**：GitOps 主要针对 Kubernetes 环境，对于传统静态资源部署，通常传统 CD 流水线已足够。
