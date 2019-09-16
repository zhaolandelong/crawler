import _ from "lodash";
import fs from "fs";
import axios from "axios";
import strRandom from "string-random";
import { parse } from "json2csv";
import {
  TOKEN,
  HEADER_MAP,
  REPORT_TABLES,
  ReportTypeWithoutStandard
} from "./constants";
import { CURRENT_YEAR } from "../constants";
import { fetchHTML, getCache, updateCache } from "../utils";
import { StringKV } from "../../typing";

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
export interface FormatJsonpData2csvRes {
  fields: CsvFieldType[];
  data: StringKV[];
}
export function formatJsonpData2csv(
  fontMap: FontMap[],
  rootData: RootData[]
): FormatJsonpData2csvRes {
  let fields: CsvFieldType[] = [];
  const data = rootData.map(da => {
    const result: StringKV = {};
    if (fields.length === 0) {
      fields = formatCsvFields(Object.keys(da));
    }
    Object.entries(da).forEach(([key, value]) => {
      let codeVal = value;
      fontMap.forEach(fm => {
        codeVal = codeVal.replace(new RegExp(fm.code, "g"), fm.value);
      });
      result[key] = codeVal;
    });
    return result;
  });
  return {
    fields,
    data
  };
}

export interface CsvFieldType {
  label: string;
  value: string;
}
export function formatCsvFields(fields: string[]): CsvFieldType[] {
  return fields.map(fKey => ({
    label: (HEADER_MAP[fKey] || "") + "_" + fKey,
    value: fKey
  }));
}

export function returnJsonpData(varName: string, evalStr: string): any {
  eval(evalStr.replace("var ", "global."));
  return eval(`global.${varName}`);
}

export function fetchStockReport(params: {
  code: string;
  reportType: ReportTypeWithoutStandard;
}): Promise<RootData | null> {
  const { code, reportType } = params;
  if (!code) {
    console.warn("[code] is required in [fetchStockReport] !");
    return new Promise(rev => rev(null));
  }
  if (!reportType) {
    console.warn("[type] is required in [fetchStockReport] !");
    return new Promise(rev => rev(null));
  }
  return getCache({
    code,
    reportType
  }).then(data => {
    if (data) return data as RootData;
    const jsonp = strRandom(6, { numbers: false });
    const { type, rt } = REPORT_TABLES[reportType];
    const baseParams = {
      filter: `(scode=${code})`, // 股票代码
      js: `var ${jsonp}={pages:(tp),data: (x),font:(font)}`, // jsonp 数据结构
      p: "1", // 页码
      ps: "50", // pageSize
      sr: "-1",
      st: "reportdate",
      token: TOKEN,
      type,
      rt
    };
    return axios
      .get("http://dcfm.eastmoney.com/em_mutisvcexpandinterface/api/js/get", {
        params: _.merge(baseParams, params)
      })
      .then(res => {
        const rootData = returnJsonpData(jsonp, res.data);
        return rootData;
      });
  });
}

type CnStandardRes = {
  fontMap: FontMap[];
  data: RootData[];
};
export function fetchPerformanceReport(code: string): Promise<CnStandardRes> {
  return getCache({
    code,
    reportType: "standard"
  }).then(standardData => {
    if (standardData) return standardData as CnStandardRes;
    return fetchHTML(`http://data.eastmoney.com/bbsj/yjbb/${code}.html`).then(
      htmlStr => {
        const fontMapMath = htmlStr.match(/"FontMapping":(\[.+"value":0}])/);
        const fontMap = JSON.parse(_.get(fontMapMath, "[1]", "[]"));

        const dataMatch = htmlStr.match(/data: (\[.+\]),font:/);
        const data = JSON.parse(_.get(dataMatch, "[1]", "[]"));
        const result = {
          fontMap,
          data
        };
        updateCache({
          code,
          reportType: "standard",
          data: JSON.stringify(result, null, 2)
        });
        return result;
      }
    );
  });
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
