# 插件开发

qkbot 使用 Fraq 原生插件。所有插件在 `src/plugins.ts` 显式安装，启动时加载，默认装配为空。

## 编写和安装

插件可从一个 `index.ts` 开始。下面的示例仅用于说明接入方式，仓库没有默认安装此功能。

```ts
// src/plugins/example/index.ts
import { definePlugin } from '@fraqjs/fraq';

export interface ExampleOptions {
  greeting: string;
}

export const examplePlugin = definePlugin({
  name: 'example',
  apply(ctx, options: ExampleOptions) {
    ctx.router.command('hello').execute(async (session) => {
      await session.reply(options.greeting);
    });
  },
});
```

在装配文件中传入参数：

```ts
// src/plugins.ts
import type { Context } from '@fraqjs/fraq';
import { examplePlugin } from './plugins/example/index.js';

export function installPlugins(ctx: Context): void {
  ctx.install(examplePlugin, { greeting: '你好' });
}
```

插件增加复杂度时再按实际职责拆分文件，指令、事件和数据操作仍归属同一插件目录。导入文件时不要启动任务或创建外部连接。

## 配置与作用范围

插件定义自己的参数类型；来自环境变量等外部输入的参数，还需在启动时校验。装配阶段读取、校验并传入配置，业务处理直接使用传入值。宿主的 `config.ts` 只管理宿主配置。

通过 Fraq 的过滤 Context 限定事件范围：

```ts
import { filter } from '@fraqjs/fraq';

const group = ctx.fork('example-group', filter.group(123456789));
group.install(examplePlugin, { greeting: '你好' });
```

根 Context 安装的插件可接收全局事件；在子 Context 安装的插件接收对应过滤范围的事件。过滤控制事件接收范围，主动推送的目标和操作权限由插件自身检查。

默认群聊支持 `/hello`、`#hello` 或 @机器人后输入 `hello`；私聊额外支持直接输入 `hello`。前缀来自宿主配置。同一作用范围内的指令名称和别名应保持唯一。

## 服务协作与资源管理

- 在 `apply` 中注册指令、事件和服务，在 `start` 中完成启动阶段的初始化。
- 通过 `provides` 声明并用 `ctx.provide` 提供公共服务；使用者通过 `inject` 声明必需服务，或通过 `optionalInject` 声明可选服务。依赖排序与缺失检查交给 Fraq。
- 公共服务按实际需求添加；业务插件通过其公开接口协作，避免直接读取其他插件的内部状态或数据表。
- 定时任务优先使用 `ctx.timeout`、`ctx.interval`。需要释放的连接等资源封装为带有 `dispose()` 方法的服务并交给 Context 管理；退出时 Fraq 调用其清理方法。
- 进行中的长任务由插件负责等待或取消。初始化过程中发生失败时，尚未交给 Context 的资源由创建者清理。
- 异步业务应返回或等待对应 Promise，后台任务自行处理失败。业务错误按需向用户反馈，详细原因写入日志。

## 数据与停用

空底座没有数据库依赖。需要存储时，插件明确配置数据路径并拥有自己的数据结构和迁移；多个插件需要共享连接时再引入数据库服务插件。

取消 `ctx.install(...)` 后重启即可停用插件。停用保留持久化数据，数据删除属于单独的维护操作。可将本地数据写到已忽略的 `data/`，实际部署路径和备份由运行环境决定。
