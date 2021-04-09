/**
 * Created by henian.xu on 2021/4/8.
 *
 */

import { createReactiveObject, Target } from './reactive';
import { mapsHandlers } from './handlers';
import { Flags } from './utils';

export function createMaps<T extends any, D extends string[]>(
  array: T[],
  ...keys: D
): T[] & {
  maps: Record<D[number], { [key: string]: T }>;
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
listMaps.push({
  id: 11,
  name: `name ${11}`,
});

console.log(
  listMaps,
  listMaps.maps.id[5],
  listMaps.maps.id[6],
  listMaps.maps.name,
);
