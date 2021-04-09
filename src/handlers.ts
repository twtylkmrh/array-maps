/**
 * Created by henian.xu on 2021/4/8.
 *
 */

import { createReactiveObject, Target, reactiveMap } from './reactive';
import { isArray, hasOwn, Flags, isDef } from './utils';

function getMaps<T extends unknown[]>(root: T) {
  return (root as T & Record<Flags, any>)[Flags.MAPS];
}

const hijacker = {
  push(this: unknown[], ...args: unknown[]): number {
    const maps = getMaps(this);
    if (maps) {
      const len = this.length;
      // Array.from(args).forEach((item: any) => {});
      Object.keys(maps).forEach((key) => {
        const map = maps[key];
        if (map) {
          Array.from(args).forEach((item: any, index) => {
            const p = item[key];
            if (isDef(p)) map[p] = len + index;
          });
          console.log(key, map);
        }
      });
      console.log('hook11', maps, args);
    }
    return Array.prototype.push.apply(this, args);
  },
  // pop(this: unknown[], ...args: unknown[]) {},
  // shift(this: unknown[], ...args: unknown[]) {},
  // unshift(this: unknown[], ...args: unknown[]) {},
  // splice(this: unknown[], ...args: unknown[]) {},
  indexOf(this: unknown[], ...args: unknown[]): number {
    const [value, key] = args as [string, string];
    let res = -1;
    let maps = getMaps(this);
    if (maps) {
      const map = (maps[key] || {})[Flags.RAW];
      if (map) res = map[value];
    }
    console.log(11111, key, res);
    if (res === -1) res = Array.prototype.indexOf.apply(this, args as any);
    return res;
  },
};

// type HijackerKeys = keyof typeof hijacker;

const keyHandlers: ProxyHandler<object> = {
  get(target: object, key: string | symbol, receiver: any): any {
    if (key === Flags.RAW) return target;
    let res = Reflect.get(target, key, receiver);
    if (!isDef(res)) return res;
    const rootTargetReactive = Reflect.get(target, Flags.ROOT, receiver);

    res = rootTargetReactive[res];

    console.log('keyHandlers', res, rootTargetReactive);

    return res;
  },
};
const keysHandlers: ProxyHandler<object> = {
  get(target: object, key: string | symbol, receiver: any): any {
    if (key === Flags.RAW) return target;
    let res = Reflect.get(target, key, receiver);
    const rootTargetReactive = Reflect.get(target, Flags.ROOT, receiver);
    const listenerKeys = rootTargetReactive[Flags.KEYS];
    if (!listenerKeys.includes(key)) return;
    if (!res) {
      let map = Object.create(null);
      Object.defineProperty(map, Flags.ROOT, { value: rootTargetReactive });
      map = rootTargetReactive.reduce(
        (pre: any, cur: Record<string | symbol, any>, index: number) => {
          const p = cur[key as string];
          if (isDef(p)) pre[p] = index;
          return pre;
        },
        map,
      );
      res = createReactiveObject(map, keyHandlers);
      Reflect.set(target, key, res, receiver);
      // console.log(`created ${key as string} map`, res);
    }
    // const rawTarget = rootTargetReactive[Flags.RAW];
    // console.log('rawTarget', rawTarget);
    /*const mapsReactive = rootTargetReactive[Flags.MAPS];
    console.log('mapsReactive', mapsReactive);
    const maps = mapsReactive[Flags.RAW];
    console.log('maps', maps);
    const currentMaps = maps[key];
    console.log('currentMaps', currentMaps);
    console.log(listenerKeys, key);*/
    return res;
  },
};

export const mapsHandlers: ProxyHandler<object> = {
  get(target: Target, key: string | symbol, receiver: any): any {
    if (key === Flags.RAW) return target;

    let res = Reflect.get(target, key, receiver);
    const targetIsArray = isArray(target);
    if (!targetIsArray) return res;
    if (hasOwn(hijacker, key)) {
      console.log(key);
      return Reflect.get(hijacker, key, receiver);
    } else if (key === 'maps') {
      res = Reflect.get(target, Flags.MAPS, receiver);
      if (res === undefined) {
        const maps = Object.create(null);
        Object.defineProperty(maps, Flags.ROOT, {
          value: reactiveMap.get(target),
        });
        res = createReactiveObject(maps, keysHandlers);
        Object.defineProperty(target, Flags.MAPS, { value: res });
        // console.log(`created ${key}`, res);
      }
    }

    return res;
  },
};
