/**
 * Created by henian.xu on 2021/4/8.
 *
 */

import { createReactiveObject, Target } from './reactive';
import { mapsHandlers } from './handlers';
import { Flags } from './utils';

/*declare global {
  interface Array<T> {
    // indexOf(searchElement: T, fromIndex?: number): number;
    indexOf(searchElementValue: any, key?: string): number;
  }
}*/

export function createMaps<T extends any, D extends string[]>(
  array: T[],
  ...keys: D
): T[] & {
  maps: Record<D[number], { [key: string]: T }>;
  indexOf(searchElementValue: any, key?: string): number;
} {
  Object.defineProperty(array, Flags.KEYS, {
    value: Array.from(keys),
  });
  return createReactiveObject(
    (array as unknown) as Target,
    mapsHandlers,
  ) as any;
}
// export default createMaps;
