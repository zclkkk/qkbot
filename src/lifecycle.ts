import process from 'node:process';
import type { Context } from '@fraqjs/fraq';

export function setupLifecycle(ctx: Context): void {
  let shutdownPromise: Promise<void> | undefined;

  async function shutdown(signal: NodeJS.Signals): Promise<void> {
    shutdownPromise ??= (async () => {
      ctx.logger.info(`收到 ${signal} 信号，正在平稳关闭机器人...`);
      await ctx.stop();
      ctx.logger.info('机器人已安全退出。');
    })();

    try {
      await shutdownPromise;
      process.exit(0);
    } catch (error) {
      ctx.logger.error('关闭过程中发生异常:', error);
      process.exit(1);
    }
  }

  const terminationSignals: NodeJS.Signals[] =
    process.platform === 'win32'
      ? ['SIGINT', 'SIGTERM', 'SIGBREAK']
      : ['SIGINT', 'SIGTERM', 'SIGHUP', 'SIGQUIT'];

  for (const signal of terminationSignals) {
    process.once(signal, () => {
      void shutdown(signal);
    });
  }
}
