import _ from "lodash";
import fs from "fs";
import axios from "axios";
import iconv from "iconv-lite";
import strRandom from "string-random";
import { parse } from "json2csv";
import { TOKEN, HEADER_MAP, ReportTableValue } from "./constants";
import { MOCK_PATH, CURRENT_YEAR, ENCODING } from "../constants";
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

export function fetchStockReport(
  params: { stockCode: string } & ReportTableValue
): Promise<RootData | null> {
  const { stockCode, ...rest } = params;
  if (!stockCode) {
    console.warn("[stockCode] is required in [fetchStockReport] !");
    return new Promise(rev => rev(null));
  }
  if (!params.type) {
    console.warn("[type] is required in [fetchStockReport] !");
    return new Promise(rev => rev(null));
  }
  const stockMockPath = `${MOCK_PATH}/${stockCode}_${params.type}.json`;
  if (fs.existsSync(stockMockPath)) {
    return new Promise((rev, rej) => {
      fs.readFile(stockMockPath, ENCODING, (err, data) => {
        if (err) rej(err);
        rev(JSON.parse(data));
      });
    });
  }
  const jsonp = strRandom(6, { numbers: false });

  const baseParams = {
    filter: `(scode=${stockCode})`, // 股票代码
    js: `var ${jsonp}={pages:(tp),data: (x),font:(font)}`, // jsonp 数据结构
    p: "1", // 页码
    ps: "50", // pageSize
    sr: "-1",
    st: "reportdate",
    token: TOKEN,
    ...rest // rt type
  };
  return axios
    .get("http://dcfm.eastmoney.com/em_mutisvcexpandinterface/api/js/get", {
      params: _.merge(baseParams, params)
    })
    .then(res => {
      const rootData = returnJsonpData(jsonp, res.data);
      return rootData;
    });
}

export function fetchPerformanceReport(
  stockCode: string
): Promise<{
  fontMap: FontMap[];
  data: RootData[];
}> {
  const performanceMockPath = `${MOCK_PATH}/${stockCode}_performance.json`;
  if (fs.existsSync(performanceMockPath)) {
    return new Promise((rev, rej) => {
      fs.readFile(performanceMockPath, ENCODING, (err, data) => {
        if (err) rej(err);
        rev(JSON.parse(data));
      });
    });
  }
  return new Promise((rev, rej) => {
    axios({
      url: `http://data.eastmoney.com/bbsj/yjbb/${stockCode}.html`,
      responseType: "stream" //将数据转化为流返回
    }).then(res => {
      //此时的res.data 则为stream
      let chunks: Buffer[] = [];
      res.data.on("data", (chunk: Buffer) => {
        chunks.push(chunk);
      });
      res.data.on("end", () => {
        let buffer = Buffer.concat(chunks);

        const htmlStr = iconv.decode(buffer, "gbk");

        const fontMapMath = htmlStr.match(/"FontMapping":(\[.+"value":0}])/);
        const fontMap = JSON.parse(_.get(fontMapMath, "[1]", "[]"));

        const dataMatch = htmlStr.match(/data: (\[.+\]),font:/);
        const data = JSON.parse(_.get(dataMatch, "[1]", "[]"));

        rev({
          fontMap,
          data
        });
      });
    });
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