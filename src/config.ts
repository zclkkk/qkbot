import process from 'node:process';
import type { LogLevel } from '@fraqjs/fraq';

export interface BotConfig {
  readonly milkyUrl: string;
  readonly milkyAccessToken: string | undefined;
  readonly logLevel: LogLevel;
  readonly prefixes: readonly string[];
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): BotConfig {
  let milkyUrl: URL;
  try {
    milkyUrl = new URL(env.MILKY_URL?.trim() ?? 'http://127.0.0.1:3010/');
  } catch {
    throw new Error('MILKY_URL 必须是有效的 HTTP(S) 地址。');
  }

  if (milkyUrl.protocol !== 'http:' && milkyUrl.protocol !== 'https:') {
    throw new Error('MILKY_URL 仅支持 http:// 或 https://。');
  }
  if (milkyUrl.username || milkyUrl.password || milkyUrl.href.includes('?') || milkyUrl.href.includes('#')) {
    throw new Error('MILKY_URL 不能包含账号、密码、查询参数或片段；鉴权请使用 MILKY_ACCESS_TOKEN。');
  }
  milkyUrl.pathname = `${milkyUrl.pathname.replace(/\/+$/, '')}/`;

  const levels: readonly LogLevel[] = ['debug', 'info', 'warn', 'error'];
  const rawLogLevel = (env.LOG_LEVEL ?? 'info').trim().toLowerCase();
  const logLevel = levels.find((level) => level === rawLogLevel);
  if (!logLevel) {
    throw new Error('LOG_LEVEL 必须是 debug、info、warn 或 error。');
  }

  const prefixes = (env.COMMAND_PREFIXES ?? '/,#').split(',').map((prefix) => prefix.trim());
  if (prefixes.some((prefix) => !prefix || /\s/.test(prefix))) {
    throw new Error('COMMAND_PREFIXES 必须是逗号分隔的非空前缀，前缀内部不能包含空白。');
  }

  return Object.freeze({
    milkyUrl: milkyUrl.toString(),
    milkyAccessToken: env.MILKY_ACCESS_TOKEN?.trim() || undefined,
    logLevel,
    prefixes: Object.freeze([...new Set(prefixes)]),
  });
}
