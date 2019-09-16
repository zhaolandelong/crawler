import {
  fetchJsonp,
  XlsxData,
  updateCache,
  checkCache,
  getCache
} from "../utils";
import { HK_REPORT_TYPE_MAP } from "./constants";
import { ReportType, CURRENT_YEAR } from "../constants";

export type HkReportPeriod = "all" | "zero" | "1" | "2" | "3"; // all - 全部 zero - 年报 1 - 中报 2 - 一季报 3 - 三季报
interface HkDataParams {
  code: string;
  reportType: ReportType;
  period?: HkReportPeriod;
}
export function fetchDataByPeriod(params: HkDataParams): Promise<XlsxData> {
  const { code, reportType, period = "zero" } = params;
  const { type, query } = HK_REPORT_TYPE_MAP[reportType];
  return fetchJsonp(
    `http://stock.finance.sina.com.cn/hkstock/api/jsonp.php/var%20tableData%20=%20/FinanceStatusService.${type}`,
    {
      symbol: code,
      [query]: period
    },
    "tableData"
  );
}

export function fetchData(params: HkDataParams): Promise<XlsxData> {
  const { code, reportType } = params;
  if (checkCache({ code, reportType })) {
    return getCache({ code, reportType }) as Promise<XlsxData>;
  }
  return Promise.all([
    fetchDataByPeriod({
      code,
      reportType,
      period: "all"
    }),
    fetchDataByPeriod({
      code,
      reportType,
      period: "zero"
    })
  ]).then(dataArr => {
    const [dataAll, dataYear] = dataArr;
    const res = [
      ...dataAll.filter(
        // 只要当年季报数据
        da => typeof da[0] === "string" && da[0] > String(CURRENT_YEAR)
      ),
      ...dataYear
    ];
    updateCache({
      code,
      reportType,
      data: JSON.stringify(res, null, 2)
    });
    console.log(`${code}_${reportType} data download finish`);
    return res;
  });
}
