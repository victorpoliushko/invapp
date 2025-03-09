export function omit<T, Key extends keyof T>(obj: T, keys: Key | Key[]): Omit<T, Key> {
  const newObj = { ...obj };

  const keysArray = Array.isArray(keys) ? keys : [keys];

  keysArray.forEach(key => delete(newObj[key]));
  return newObj;
}
