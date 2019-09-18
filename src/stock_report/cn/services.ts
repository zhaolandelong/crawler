import _ from "lodash";
import strRandom from "string-random";
import { decodeData } from "./utils";
import { getCache, fetchHTML, updateCache, fetchJsonp } from "../utils";
import { CN_REPORT_TYPE_MAP, TOKEN } from "./constants";
import { StringKV } from "../../typing";
import { ReportTypeWithoutStandard } from "../constants";

export function fetchStandard(code: string): Promise<StringKV[]> {
  return getCache({
    code,
    reportType: "standard"
  }).then(standardData => {
    if (standardData) return standardData as StringKV[];
    return fetchHTML(`http://data.eastmoney.com/bbsj/yjbb/${code}.html`).then(
      htmlStr => {
        const fontMapMath = htmlStr.match(/"FontMapping":(\[.+"value":0}])/);
        const fontMap = JSON.parse(_.get(fontMapMath, "[1]", "[]"));
        const dataMatch = htmlStr.match(/data: (\[.+\]),font:/);
        const data = JSON.parse(_.get(dataMatch, "[1]", "[]"));
        const result = decodeData(fontMap, data);
        updateCache({
          code,
          reportType: "standard",
          data: JSON.stringify(result, null, 2)
        });
        console.log(`${code}_standard data download finish`);

        return result;
      }
    );
  });
}

export function fetchOtherReport(params: {
  code: string;
  reportType: ReportTypeWithoutStandard;
}): Promise<StringKV[]> {
  const { code, reportType } = params;
  return getCache({
    code,
    reportType
  }).then(data => {
    if (data) return data as StringKV[];
    const callback = strRandom(6, { numbers: false });
    const baseParams = {
      filter: `(scode=${code})`, // 股票代码
      js: `var ${callback}={pages:(tp),data: (x),font:(font)}`, // jsonp 数据结构
      p: "1", // 页码
      ps: "50", // pageSize
      sr: "-1",
      st: "reportdate",
      token: TOKEN,
      ...CN_REPORT_TYPE_MAP[reportType].query
    };

    return fetchJsonp(
      "http://dcfm.eastmoney.com/em_mutisvcexpandinterface/api/js/get",
      _.merge(baseParams, params),
      callback
    ).then(res => {
      const result = decodeData(
        _.get(res, "font.FontMapping", []),
        _.get(res, "data", [])
      );
      updateCache({
        code,
        reportType,
        data: JSON.stringify(result, null, 2)
      });
      console.log(`${code}_${reportType} data download finish`);
      return result;
    });
  });
}
