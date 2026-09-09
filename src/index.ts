import process from 'node:process';
import { createColoredLogHandler } from '@fraqjs/color-log';
import { Context } from '@fraqjs/fraq';
import { loadConfig } from './config.js';
import { setupLifecycle } from './lifecycle.js';
import { installPlugins } from './plugins.js';
import { createActivationResolver } from './routing.js';

try {
  const config = loadConfig();
  const ctx = Context.fromUrl(config.milkyUrl, {
    accessToken: config.milkyAccessToken,
    routing: { activationResolver: createActivationResolver(config.prefixes) },
  });
  ctx.logBus.on('log', createColoredLogHandler({ minLevel: config.logLevel }));
  const shutdown = setupLifecycle(ctx);

  try {
    installPlugins(ctx);
    ctx.logger.info(`Milky 地址：${config.milkyUrl}`);
    await ctx.start();
    if (ctx.state === 'started' && process.exitCode === undefined) {
      ctx.logger.info('qkbot 初始化完成，连接状态见事件源日志。');
    }
  } catch (error) {
    ctx.logger.error('qkbot 启动失败。', error);
    await shutdown(1);
  }
} catch (error) {
  console.error('qkbot 启动失败：', error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
