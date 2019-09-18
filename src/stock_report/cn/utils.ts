import _ from "lodash";
import { XlsxData } from "../constants";
import { StringKV } from "../../typing";

export interface FontMap {
  code: string;
  value: number;
}

export function decodeData(
  fontMap: FontMap[],
  rootData: StringKV[]
): StringKV[] {
  return rootData.map(da => {
    const result: StringKV = {};
    Object.entries(da).forEach(([key, value]) => {
      let codeVal = value;
      fontMap.forEach(fm => {
        codeVal = codeVal.replace(new RegExp(fm.code, "g"), String(fm.value));
      });
      result[key as keyof StringKV] = codeVal;
    });
    return result;
  });
}

export function formatObj2ArrByHeader(
  data: StringKV[],
  headers: StringKV
): XlsxData[] {
  const headerKeys = Object.keys(headers);
  const xlsxData = data.map(da => {
    return headerKeys.reduce((accumulator: XlsxData, current) => {
      accumulator.push(da[current]);
      return accumulator;
    }, []);
  });
  // xlsxData.unshift(Object.values(headers));
  return xlsxData;
}

export function dataFilterCallback(
  reportData: string,
  from: number,
  to: number
): boolean {
  return (
    reportData > String(to) ||
    new RegExp(`^(${_.times(to - from, i => from + i).join("|")})-12-31`).test(
      reportData
    )
  );
}
