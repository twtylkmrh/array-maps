/**
 * Created by henian.xu on 2021/4/8.
 *
 */

export const enum ReactiveFlags {
  RAW = '__a_m_raw',
}

export interface Target {
  [ReactiveFlags.RAW]: any;
}

export const reactiveMap = new WeakMap<Target, any>();

export function createReactiveObject(
  target: Target,
  handlers: ProxyHandler<any>,
) {
  const proxy = new Proxy(target, handlers);
  reactiveMap.set(target, proxy);
  return proxy;
}

export function reactive<T extends object, D extends string[]>(
  target: T,
  ...keys: D
): T;
export function reactive(target: object) {
  return createReactiveObject(target as Target, {});
}
