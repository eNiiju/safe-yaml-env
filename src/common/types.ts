export type Data =
  | string
  | number
  | boolean
  | null
  | undefined
  | DataArray
  | DataObject;
export type DataArray = Array<Data>;
export interface DataObject extends Record<string, Data> {}
