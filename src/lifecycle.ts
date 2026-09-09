import process from 'node:process';
import type { Context } from '@fraqjs/fraq';

export function setupLifecycle(ctx: Context): (exitCode?: number) => Promise<void> {
  let shutdownPromise: Promise<void> | undefined;

  function shutdown(exitCode = 0): Promise<void> {
    process.exitCode = Math.max(Number(process.exitCode ?? 0), exitCode);
    shutdownPromise ??= (async () => {
      ctx.logger.info('正在关闭 qkbot...');

      // 不阻止正常退出；资源未能关闭时，最多等待 10 秒。
      setTimeout(() => {
        ctx.logger.error('关闭超过 10 秒，强制退出。');
        process.exit(1);
      }, 10_000).unref();

      try {
        await ctx.stop();
        ctx.logger.info('qkbot 已停止。');
      } catch (error) {
        process.exitCode = 1;
        ctx.logger.error('qkbot 资源清理失败。', error);
      }
    })();
    return shutdownPromise;
  }

  const signals: NodeJS.Signals[] = process.platform === 'win32'
    ? ['SIGINT', 'SIGTERM', 'SIGBREAK']
    : ['SIGINT', 'SIGTERM', 'SIGHUP', 'SIGQUIT'];

  for (const signal of signals) {
    process.on(signal, () => {
      if (!shutdownPromise) ctx.logger.info(`收到 ${signal} 信号。`);
      void shutdown();
    });
  }

  return shutdown;
}
