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

const rawList = Array(10)
  .fill('')
  .map((item, index) => {
    return {
      id: index,
      name: `name ${index}`,
    };
  });

const listMaps = createMaps(rawList, 'id', 'name');
console.log(listMaps.maps.id[5]);
listMaps.push({
  id: 11,
  name: `name ${11}`,
});

const raw = listMaps.indexOf(listMaps[5], 0);
// const i = listMaps.indexOf(11, 'id');
const i = listMaps.indexOf('name 11', 'name');
console.log('indexOf', i, raw);

console.log(listMaps, listMaps.maps.id[6], listMaps.maps.name['name 11']);
