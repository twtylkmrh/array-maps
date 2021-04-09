/**
 * Created by henian.xu on 2021/4/9.
 *
 */

export const isArray = Array.isArray;

const hasOwnProperty = Object.prototype.hasOwnProperty;
export const hasOwn = (
  val: object,
  key: string | symbol,
): key is keyof typeof val => hasOwnProperty.call(val, key);

export const enum Flags {
  MAPS = '__am_maps',
  KEYS = '__am_keys',
  RAW = '__am_raw',
  ROOT = '__am_root',
}
