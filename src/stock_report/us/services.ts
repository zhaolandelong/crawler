import cheerio from "cheerio";
import _ from "lodash";
import { getCache, fetchHTML, updateCache } from "../utils";
import { ReportTypeWithoutStandard, XlsxData } from "../constants";
import { USQueryType, US_REPORT_TYPE_MAP } from "./constants";

export function fetchData(
  code: string,
  reportType: ReportTypeWithoutStandard,
  name?: string
): Promise<XlsxData[]> {
  return getCache({
    code,
    reportType
  }).then(cacheData => {
    if (cacheData) return cacheData as XlsxData[];
    const { type, headers } = US_REPORT_TYPE_MAP[reportType];
    return Promise.all([
      fetchDataByPeriod(code, type, "quarter", name || code),
      fetchDataByPeriod(code, type, "annual", name || code)
    ]).then(resArr => {
      const result: XlsxData[] = _.concat(...resArr);

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

function fetchDataByPeriod(
  code: string,
  type: USQueryType,
  period: "quarter" | "annual",
  name: string
): Promise<XlsxData[]> {
  return fetchHTML(
    `http://quotes.sina.com.cn/usstock/hq/${type}.php?s=${code}&t=${period}`
  ).then(htmlStr => {
    const tmp: string[][] = [];
    const $ = cheerio.load(htmlStr);
    const $table = $(".data_tbl").eq(1);
    const $rows = $table.find("tr");

    $rows.each((i, row) => {
      const rowData: string[] = [];
      $(row)
        .children("td")
        .each((j, td) => {
          rowData.push(
            $(td)
              .text()
              .replace(/\s+|至/g, "")
          );
        });
      tmp.push(rowData);
    });
    const result = tmp[0].map((col, i) =>
      [code, name, period].concat(tmp.map(row => row[i]))
    );
    return result;
  });
}
