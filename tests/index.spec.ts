/**
 * Created by henian.xu on 2021/4/12.
 *
 */

import { createMaps } from '../src';

const testList = Array(10)
  .fill('')
  .map((item, index) => {
    return {
      id: index,
      name: `name ${index}`,
    };
  });

const listMaps = createMaps(testList, 'id', 'name');

describe('array-maps', () => {
  it('should hold a value', () => {
    listMaps.push({
      id: 11,
      name: `name ${11}`,
    });
    expect(listMaps).toStrictEqual(testList);
  });
  it('maps', () => {
    expect(listMaps.maps.id[6]).toEqual({
      id: 6,
      name: 'name 6',
    });
    expect(listMaps.maps.name[`name ${11}`]).toEqual({
      id: 11,
      name: `name ${11}`,
    });
  });
  it('indexOf', () => {
    const rawIndex = listMaps.indexOf(testList[5], 3);
    const nameIndex = listMaps.indexOf('name 11', 'name');
    const idIndex = listMaps.indexOf(8, 'id');
    expect(rawIndex).toBe(5);
    expect(nameIndex).toBe(10);
    expect(idIndex).toBe(8);
  });
});
