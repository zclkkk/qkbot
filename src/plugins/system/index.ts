import { definePlugin } from '@fraqjs/fraq';
import { registerPing } from './ping.js';
import { registerStatus } from './status.js';

export interface SystemPluginOptions {
  milkyUrl?: string;
}

export const systemPlugin = definePlugin({
  name: 'system',
  apply(ctx, options?: SystemPluginOptions) {
    const url = options?.milkyUrl ?? 'http://127.0.0.1:3010/';
    registerPing(ctx.router);
    registerStatus(ctx, url);
  },
});

export default systemPlugin;
