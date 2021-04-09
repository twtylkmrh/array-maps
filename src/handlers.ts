/**
 * Created by henian.xu on 2021/4/8.
 *
 */

import { createReactiveObject, Target, reactiveMap } from './reactive';
import { hijacker } from './hijacker';
import { isArray, hasOwn, Flags } from './utils';

const keysHandlers: ProxyHandler<object> = {
  get(target: object, key: string | symbol, receiver: any): any {
    let res = Reflect.get(target, key, receiver);
    if (key === Flags.RAW) {
      return target;
    }
    const rootTargetReactive = Reflect.get(target, Flags.ROOT, receiver);
    const listenerKeys = rootTargetReactive[Flags.KEYS];
    if (!listenerKeys.includes(key)) return;
    if (!res) {
      res = rootTargetReactive.reduce(
        (pre: any, cur: Record<string | symbol, any>) => {
          const k = cur[key as string];
          pre[k] = cur;
          return pre;
        },
        {},
      );
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
    let res = Reflect.get(target, key, receiver);
    const targetIsArray = isArray(target);
    if (!targetIsArray) return res;
    if (hasOwn(hijacker, key)) {
      console.log(key);
      return Reflect.get(hijacker, key, receiver);
    }
    if (key === Flags.RAW) {
      return target;
    } else if (key === 'maps') {
      res = Reflect.get(target, Flags.MAPS, receiver);
      if (res === undefined) {
        const m = Object.create(null);
        Object.defineProperty(m, Flags.ROOT, {
          value: reactiveMap.get(target),
        });
        res = createReactiveObject(m, keysHandlers);
        Object.defineProperty(target, Flags.MAPS, { value: res });
        // console.log(`created ${key}`, res);
      }
    }

    return res;
  },
  set(
    target: object,
    key: string | symbol,
    value: any,
    receiver: any,
  ): boolean {
    const result = Reflect.set(target, key, value, receiver);

    // console.log('mapsHandlers set', key);

    return result;
  },
};
