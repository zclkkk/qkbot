# qkbot

基于 Fraq 原生插件的 TypeScript QQ 机器人应用。默认不安装任何插件，连接 Milky 协议端后保持运行，不回复业务消息。

## 环境与运行

需要 Node.js >= 24，以及已运行的 Milky 协议端。

```bash
npm ci
npm run typecheck
npm run build
npm start
```

开发时运行 `npm run dev`，源码变化会触发进程重启。正式运行使用编译后的 `dist/index.js`，无需 tsx。

应用从进程环境读取配置，不自动加载 `.env`。`.env.example` 仅用于说明配置格式；需要从外部文件加载时，可使用 Node.js：

```bash
node --env-file=/path/to/qkbot.env dist/index.js
```

开发时也可以显式加载文件：

```bash
node --env-file=/path/to/qkbot.env --import tsx --watch src/index.ts
```

## 配置

| 环境变量 | 默认值 | 说明 |
| --- | --- | --- |
| `MILKY_URL` | `http://127.0.0.1:3010/` | HTTP(S) 基础地址，支持路径前缀；不接受账号、密码、查询参数或片段 |
| `MILKY_ACCESS_TOKEN` | 空 | Milky 访问令牌，同时用于 HTTP API 和 WebSocket |
| `LOG_LEVEL` | `info` | `debug`、`info`、`warn`、`error`，忽略大小写 |
| `COMMAND_PREFIXES` | `/,#` | 逗号分隔的非空前缀；重复值合并，前缀内部不能有空白 |

配置在创建连接之前校验，非法配置会以非零状态退出。

默认指令规则：群聊使用前缀或 @机器人，私聊额外允许直接指令。这些规则仅作用于插件注册的路由；插件自己的原始事件监听需自行判断处理条件。

## 代码结构

```text
src/
├── index.ts       # 创建 Context，接入日志并启动
├── config.ts      # 读取与校验宿主配置
├── routing.ts     # 群聊、私聊的指令触发规则
├── lifecycle.ts   # 退出信号、启动失败清理与退出期限
├── plugins.ts     # 显式装配插件，初始为空
└── plugins/       # 按需添加插件
docs/
└── plugins.md     # 插件接入约定
```

插件直接使用 Fraq 的 `definePlugin`、`ctx.install` 和服务注入。增加功能时，在 `src/plugins/` 编写插件，然后在 `src/plugins.ts` 安装；修改装配后重启生效。详见 [插件开发](docs/plugins.md)。

## 运行行为

- `qkbot 初始化完成` 表示 Context 已启动；`websocket connected` 才表示事件连接成功，两者均不等同于 QQ 账号在线确认。
- Milky 断连由 Fraq 自动重连。qkbot 不管理协议端或签名端进程。
- 配置或插件初始化失败会以非零状态退出；已创建的 Context 会先执行清理。
- 收到退出信号后调用 `ctx.stop()`，最多等待 10 秒。插件持有的长任务需要自行实现等待或取消。
- 日志输出到标准输出和标准错误。实际配置、进程托管、日志保留、数据路径与备份由运行环境管理。

`dist/`、`data/` 和实际 `.env` 文件不纳入版本控制。当前不引入测试框架，使用类型检查、构建和启动／重连／退出检查验证底座；后续按业务需要添加自动化测试。
