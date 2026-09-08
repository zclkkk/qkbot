import process from 'node:process';
import { createColoredLogHandler } from '@fraqjs/color-log';
import type { LogLevel } from '@fraqjs/kernel';
import type { RouteActivation, RouteActivationResolver } from '@fraqjs/fraq';

export interface BotConfig {
  milkyUrl: string;
  logLevel: LogLevel;
  prefixes: string[];
  logHandler: ReturnType<typeof createColoredLogHandler>;
  activationResolver: RouteActivationResolver;
}

const rawMilkyUrl = process.env.MILKY_URL?.trim() || 'http://127.0.0.1:3010/';
const milkyUrl = rawMilkyUrl.endsWith('/') ? rawMilkyUrl : `${rawMilkyUrl}/`;

const validLogLevels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
const rawLogLevel = process.env.LOG_LEVEL?.trim().toLowerCase() as LogLevel;
const logLevel: LogLevel = validLogLevels.includes(rawLogLevel) ? rawLogLevel : 'info';

const rawPrefixes = process.env.COMMAND_PREFIXES?.trim();
const prefixes: string[] = rawPrefixes
  ? rawPrefixes.split(',').map((p: string) => p.trim()).filter(Boolean)
  : ['/', '#'];

/**
 * 路由触发解析器：
 * 允许用户通过以下任意方式触发指令：
 * 1. 前缀触发（例如 /ping 或 #ping）
 * 2. @机器人 触发（例如 @绒布球 ping）
 * 3. 直接输入指令（例如 ping）
 */
const activationResolver: RouteActivationResolver = (_route, _session) => {
  const activations: RouteActivation[] = [
    { type: 'direct' },
    { type: 'mention' },
    ...prefixes.map((prefix: string) => ({ type: 'prefix' as const, prefix })),
  ];
  return activations;
};

export const config: BotConfig = Object.freeze({
  milkyUrl,
  logLevel,
  prefixes,
  logHandler: createColoredLogHandler({ minLevel: logLevel }),
  activationResolver,
});
