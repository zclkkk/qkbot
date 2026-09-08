# qkbot

基于 [Fraq](https://fraq.dev/) 框架与 [Milky](https://milky.ntqqrev.org/) 协议构建的现代 TypeScript QQ 机器人。

## 特性

- **强类型指令系统**：基于 `@fraqjs/fraq` 声明式参数路由，参数类型自动推断与拦截
- **高内聚插件架构**：采用 `definePlugin` 模块化分层，业务高内聚低耦合
- **多路由触发模式**：内置支持前缀（`/`、`#`）、`@机器人` 与直接指令触发
- **优雅停机保护**：捕获系统信号自动执行 `ctx.stop()` 安全清理连接与状态
- **轻量纯粹**：纯原生 TypeScript 项目，无厚重 WebUI，极简依赖
- **热重载开发**：使用 `tsx watch` 实现毫秒级修改热更新

## 架构设计

```text
src/
├── config.ts              # 集中配置管理与校验（类型安全、环境检查）
├── lifecycle.ts           # 进程生命周期与优雅停机 (SIGINT/SIGTERM -> ctx.stop())
├── plugins/               # 业务功能模块（可复用插件）
│   └── system/            # 系统基础功能 (ping, status)
│       ├── index.ts
│       ├── ping.ts
│       └── status.ts
└── index.ts               # 装配根入口（Composition Root）
```

## 快速开始

### 准备环境

- Node.js >= 22 (推荐 LTS)
- 已运行的 Milky 协议端（如 Yogurt）

### 安装依赖

```bash
npm install
```

### 配置

复制配置样例并按需修改：

```bash
cp .env.example .env
```

### 开发与运行

```bash
# 启动热重载开发模式（推荐开发时使用）
npm run dev

# 启动常规生产模式
npm start
```

## 内置指令

- `ping` / `存活`：测试连通性，回复 `pong! 🏓`
- `status` / `状态`：查看机器人运行时间、内存占用与 Milky 服务状态
