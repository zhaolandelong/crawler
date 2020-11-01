import {
  XlsxDataMap,
  XlsxData,
  ReportTypeWithoutStandard,
  DATA_PATH,
  DEAL_YEAR,
  CURRENT_YEAR,
  StockObj
} from "../constants";
import { US_REPORT_TYPE_MAP } from "./constants";
import _ from "lodash";
import { exportXlsx, mergeDataByStock } from "../utils";
import { fetchData } from "./services";

export default {
  run(codeArr: StockObj[]): void {
    const allPromise: Promise<XlsxDataMap>[] = [];
    codeArr.forEach(({ code, name }) => {
      allPromise.push(
        new Promise((rev, rej) => {
          setTimeout(() => {
            const promiseArr: Promise<XlsxData[]>[] = [];
            const dataMap = {} as XlsxDataMap;
            Object.keys(US_REPORT_TYPE_MAP).forEach(key => {
              const reportType = key as ReportTypeWithoutStandard;
              promiseArr.push(
                fetchData(code, reportType, name).then(res => {
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
        if (typeof row[2] === "string" && typeof row[3] === "string") {
          return (
            (row[2] === "quarter" && row[3] > String(CURRENT_YEAR)) ||
            (row[2] === "annual" && row[3] > String(DEAL_YEAR))
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
        `${DATA_PATH}/us_${new Date()}.xlsx`,
        allData
      );
    });
  },
  checkStock(code: string): boolean {
    return /^[A-Za-z]+$/.test(code);
  }
};
