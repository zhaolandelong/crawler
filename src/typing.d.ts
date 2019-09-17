export type StringKV = Record<string, string>;
declare module "*.json" {
  const value: any;
  export default value;
}