import { Context } from '@fraqjs/fraq';
import { config } from './config.js';
import { setupLifecycle } from './lifecycle.js';
import { systemPlugin } from './plugins/system/index.js';

const ctx = Context.fromUrl(config.milkyUrl, {
  logHandler: config.logHandler,
  routing: {
    activationResolver: config.activationResolver,
  },
});

// 挂载业务功能插件
ctx.install(systemPlugin, { milkyUrl: config.milkyUrl });

// 注册进程生命周期与优雅停机
setupLifecycle(ctx);

ctx.logger.info(`正在连接 Milky 协议端 (${config.milkyUrl})...`);
await ctx.start();
ctx.logger.info('qkbot 机器人已成功启动并开始监听事件！');
