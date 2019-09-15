import { fetchJsonp } from "../utils";
import { HK_REPORT_TYPE_MAP } from "./constants";
import { ReportType } from "../constants";

export type HkReportPeriod = "all" | "zero" | "1" | "2" | "3"; // all - 全部 zero - 年报 1 - 中报 2 - 一季报 3 - 三季报
interface HkDataParams {
  code: string;
  reportType: ReportType;
  period?: HkReportPeriod;
}
export function fetchData(
  params: HkDataParams
): Promise<(string | null | number)[][]> {
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
