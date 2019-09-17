import _ from "lodash";
import fs from "fs";
import { parse } from "json2csv";
import { CURRENT_YEAR } from "../constants";
import { StringKV, XlsxData } from "../../typing";

export interface FontMap {
  code: string;
  value: number;
}
export interface RootData {
  scode: string;
  sname: string;
  securitytype: string;
  trademarket: string;
  latestnoticedate: string;
  reportdate: string;
  publishname: string;
  securitytypecode: string;
  trademarketcode: string;
  firstnoticedate: string;
  basiceps: string;
  cutbasiceps: string;
  totaloperatereve: string;
  ystz: string;
  yshz: string;
  parentnetprofit: string;
  sjltz: string;
  sjlhz: string;
  roeweighted: string;
  bps: string;
  mgjyxjje: string;
  xsmll: string;
  assigndscrpt: string;
  gxl: string;
}

export function decodeData(
  fontMap: FontMap[],
  rootData: StringKV[]
): StringKV[] {
  return rootData.map(da => {
    const result = {} as StringKV;
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
  xlsxData.unshift(Object.values(headers));
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

export function buildDiy(dataArr: StringKV[][]) {
  const [mergeObj, ...mergeSource] = dataArr;
  const totalData = _.merge(mergeObj, ...mergeSource).filter(
    (data: StringKV) => {
      const reportDate = data.reportdate;
      // current year all report
      // or
      // recent 3 years year-report
      return (
        reportDate > String(CURRENT_YEAR) ||
        new RegExp(
          `^(${CURRENT_YEAR - 1}|${CURRENT_YEAR - 2}|${CURRENT_YEAR - 3})-12-31`
        ).test(reportDate)
      );
    }
  );

  const csv = parse(totalData, {
    fields: [
      {
        label: "代码",
        value: "scode"
      },
      {
        label: "名称",
        value: "sname"
      },
      {
        label: "报告期",
        value: "reportdate"
      },
      {
        label: "行业",
        value: "publishname"
      },
      {
        label: "营业总收入(元)",
        value: "totaloperatereve"
      },
      {
        label: "同比增长(%)",
        value: "ystz"
      },
      {
        label: "季度环比增长(%)",
        value: "yshz"
      },
      {
        label: "销售商品、提供劳务收到的现金",
        value: "salegoodsservicerec"
      },
      {
        label: "销售商品、提供劳务收到的现金占比",
        value: "salegoodsservicerec_zb"
      },
      {
        label: "净利润(元)",
        value: "parentnetprofit"
      },
      {
        label: "净利润同比(%)",
        value: "sjltz"
      },
      {
        label: "季度环比增长(%)",
        value: "sjlhz"
      },
      {
        label: "销售毛利率(%)",
        value: "xsmll"
      },
      {
        label: "总负债(元)",
        value: "sumliab"
      },
      {
        label: "总负债同比(%)",
        value: "tdetz"
      }
    ]
  });
  fs.appendFile(`./data/diy_report.csv`, csv, "utf-8", err => {
    err && console.log(err);
  });
}
