import type { Router } from '@fraqjs/fraq';

export function registerPing(router: Router): void {
  router
    .command('ping')
    .describe('测试机器人连通性')
    .alias('存活')
    .execute(async (session) => {
      await session.reply('pong! 🏓');
    });
}
