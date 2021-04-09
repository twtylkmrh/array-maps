/**
 * Created by henian.xu on 2021/4/9.
 *
 */
import { Flags } from './utils';

function getMaps<T extends unknown[]>(root: T) {
  return (root as T & Record<Flags, any>)[Flags.MAPS];
}

const handlers = {
  push(this: unknown[], ...args: unknown[]) {
    const maps = getMaps(this);
    if (!maps) return;
    console.log('hook11', maps);
  },
  // pop(this: unknown[], ...args: unknown[]) {},
  // shift(this: unknown[], ...args: unknown[]) {},
  // unshift(this: unknown[], ...args: unknown[]) {},
  // splice(this: unknown[], ...args: unknown[]) {},
};

type HandlersKeys = keyof typeof handlers;

export const hijacker: Record<HandlersKeys, Function> = {} as any;

// (['push', 'pop', 'shift', 'unshift', 'splice'] as const).forEach((key) => {
(Object.keys(handlers) as HandlersKeys[]).forEach((key) => {
  const method = Array.prototype[key] as any;
  hijacker[key] = function fuc(this: unknown[], ...args: unknown[]) {
    const res = method.apply(this, args);
    handlers[key].apply(this, args);
    console.log(this);
    return res;
  };
});
