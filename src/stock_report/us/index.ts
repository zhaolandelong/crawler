import {
  XlsxDataMap,
  XlsxData,
  ReportTypeWithoutStandard,
  DATA_PATH,
  DEAL_YEAR,
  CURRENT_YEAR
} from "../constants";
import { US_REPORT_TYPE_MAP } from "./constants";
import _ from "lodash";
import { exportXlsx, mergeDataByStock } from "../utils";
import { fetchData } from "./services";

export default {
  run(codeArr: string[]): void {
    const allPromise: Promise<XlsxDataMap>[] = [];
    codeArr.forEach(code => {
      allPromise.push(
        new Promise((rev, rej) => {
          setTimeout(() => {
            const promiseArr: Promise<XlsxData[]>[] = [];
            const dataMap = {} as XlsxDataMap;
            Object.keys(US_REPORT_TYPE_MAP).forEach(key => {
              const reportType = key as ReportTypeWithoutStandard;
              promiseArr.push(
                fetchData(code, reportType).then(res => {
                  dataMap[reportType] = res;
                  return res;
                })
              );
            });
            Promise.all(promiseArr).then(() => {
              rev(_.cloneDeep(dataMap));

              // 每个都生成单独的文件
              // 加头
              // Object.entries(dataMap).forEach(([key, value]) => {
              //   value.unshift(
              //     US_REPORT_TYPE_MAP[key as ReportTypeWithoutStandard].headers
              //   );
              //   return value;
              // });
              // exportXlsx(`${DATA_PATH}/${code}.xlsx`, dataMap);
            });
          }, 100);
        })
      );
    });
    Promise.all(allPromise).then(allDataArr => {
      const allData = mergeDataByStock(allDataArr, row => {
        if (typeof row[1] === "string" && typeof row[2] === "string") {
          return (
            (row[1] === "quarter" && row[2] > String(CURRENT_YEAR)) ||
            (row[1] === "annual" && row[2] > String(DEAL_YEAR))
          );
        }
        return false;
      });
      // 加头
      Object.entries(allData).forEach(([key, value]) => {
        const headers = _.get(US_REPORT_TYPE_MAP, `${key}.headers`);
        if (value && headers) {
          value.unshift(headers);
        }
        return value;
      });
      exportXlsx(
        `${DATA_PATH}/us_${new Date().toLocaleString()}.xlsx`,
        allData
      );
    });
  },
  checkStock(code: string): boolean {
    return /^[A-Za-z]+$/.test(code);
  }
};
