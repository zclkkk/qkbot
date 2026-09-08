import process from 'node:process';
import type { Context } from '@fraqjs/fraq';

export function registerStatus(ctx: Context, milkyUrl: string): void {
  ctx.router
    .command('status')
    .describe('查看机器人运行状态')
    .alias('状态')
    .execute(async (session) => {
      const uptimeSec = Math.floor(process.uptime());
      const h = Math.floor(uptimeSec / 3600);
      const m = Math.floor((uptimeSec % 3600) / 60);
      const s = uptimeSec % 60;
      const memRss = (process.memoryUsage().rss / 1024 / 1024).toFixed(1);
      const memHeap = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);

      let botName = 'Bot';
      let botUin = session.selfId;

      try {
        const login = await ctx.client.get_login_info();
        botName = login.nickname;
        botUin = login.uin;
      } catch {
        // 网络异常或未就绪时容错降级
      }

      await session.reply(
        `🤖 ${botName} (${botUin})\n` +
        `⏱️ 运行时间: ${h}时${m}分${s}秒\n` +
        `💾 内存占用: RSS ${memRss} MB / 堆 ${memHeap} MB\n` +
        `📡 Milky 服务: ${milkyUrl}\n` +
        `🚀 Node.js: ${process.version}`
      );
    });
}
