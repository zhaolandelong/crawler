import _ from "lodash";
import { CN_REPORT_TYPE_MAP } from "./constants";
import { fetchStandard, fetchOtherReport } from "./services";
import { ReportType, DEAL_YEAR, CURRENT_YEAR } from "../constants";
import { StringKV, XlsxData } from "../../typing";
import { exportXlsx } from "../utils";
import { formatObj2ArrByHeader, dataFilterCallback } from "./utils";

export default {
  run(codeArr: string[]) {
    codeArr.forEach(code => {
      const promiseArr: Promise<StringKV[]>[] = [];
      Object.keys(CN_REPORT_TYPE_MAP).forEach(key => {
        const reportType = key as ReportType;
        if (reportType === "standard") {
          promiseArr.push(
            fetchStandard(code).then(res =>
              res.filter(row =>
                dataFilterCallback(row.reportdate, DEAL_YEAR, CURRENT_YEAR)
              )
            )
          );
        } else {
          promiseArr.push(
            fetchOtherReport({
              code,
              reportType
            }).then(res =>
              res.filter(row =>
                dataFilterCallback(row.reportdate, DEAL_YEAR, CURRENT_YEAR)
              )
            )
          );
        }
      });
      Promise.all(promiseArr).then(resArr => {
        const dataMap = {} as Record<ReportType, XlsxData[]>;
        Object.keys(CN_REPORT_TYPE_MAP).forEach((key, index) => {
          const reportType = key as ReportType;
          dataMap[reportType] = formatObj2ArrByHeader(
            resArr[index],
            CN_REPORT_TYPE_MAP[reportType].headers
          );
        });
        exportXlsx(code, dataMap);
      });
    });
  }
};
