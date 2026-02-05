/**
 * Значение, которое можно логировать.
 * Примитивы, Error, объекты и массивы.
 */
export type LogValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Error
  | { [key: string]: LogValue }
  | LogValue[];
