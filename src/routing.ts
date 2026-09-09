import type { RouteActivation, RouteActivationResolver } from '@fraqjs/fraq';

export function createActivationResolver(prefixes: readonly string[]): RouteActivationResolver {
  const groupActivations: RouteActivation[] = [
    { type: 'mention' },
    ...prefixes.map((prefix): RouteActivation => ({ type: 'prefix', prefix })),
  ];
  const privateActivations: RouteActivation[] = [{ type: 'direct' }, ...groupActivations];

  return (_route, session) =>
    session.raw.message_scene === 'friend' ? privateActivations : groupActivations;
}
