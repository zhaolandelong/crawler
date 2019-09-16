import _ from "lodash";
import { fetchData } from "./services";
import { HK_REPORT_TYPE_MAP } from "./constants";
import { ReportType, DEAL_YEAR, CURRENT_YEAR } from "../constants";
import { updateCache, exportXlsx, XlsxData } from "../utils";

export default {
  run(codeArr: string[]): void {
    codeArr.forEach(code => {
      setTimeout(() => {
        const promiseArr: Promise<XlsxData>[] = [];
        Object.keys(HK_REPORT_TYPE_MAP).forEach(key => {
          const reportType = key as ReportType;
          promiseArr.push(
            fetchData({
              code,
              reportType
            }).then(res => {
              res.unshift(HK_REPORT_TYPE_MAP[reportType].headers);
              // 只要 DEAL_YEAR 后的数据
              return res.filter(
                row => typeof row[0] === "string" && row[0] > String(DEAL_YEAR)
              );
            })
          );
        });
        Promise.all(promiseArr).then(resArr => {
          const dataMap = {} as Record<ReportType, XlsxData>;
          Object.keys(HK_REPORT_TYPE_MAP).forEach((key, index) => {
            dataMap[key as ReportType] = resArr[index];
          });
          exportXlsx(code, dataMap);
        });
      }, 100);
    });
  }
};
