import _ from "lodash";
import { fetchData } from "./services";
import { HK_REPORT_TYPE_MAP } from "./constants";
import {
  ReportType,
  DEAL_YEAR,
  DATA_PATH,
  XlsxData,
  XlsxDataMap
} from "../constants";
import { exportXlsx } from "../utils";

export default {
  run(codeArr: string[]): void {
    const allData: XlsxDataMap = {
      standard: [],
      cash: [],
      profit: [],
      balance: []
    };
    const allPromise: Promise<XlsxDataMap>[] = [];
    codeArr.forEach(code => {
      allPromise.push(
        new Promise((rev, rej) => {
          setTimeout(() => {
            const promiseArr: Promise<XlsxData[]>[] = [];
            const dataMap = {} as XlsxDataMap;
            Object.keys(HK_REPORT_TYPE_MAP).forEach(key => {
              const reportType = key as ReportType;
              promiseArr.push(
                fetchData({
                  code,
                  reportType
                }).then(res => {
                  const result = res
                    // .filter(
                    //   row =>
                    //     typeof row[0] === "string" && row[0] > String(DEAL_YEAR)
                    // )
                    .map(row => {
                      row.unshift(code);
                      return row;
                    });
                  dataMap[reportType] = result;

                  return result;
                })
              );
            });
            Promise.all(promiseArr).then(() => {
              rev(_.cloneDeep(dataMap));

              // 每个都生成单独的文件
              // 加头
              // Object.entries(dataMap).forEach(([key, value]) => {
              //   value.unshift([
              //     "股票代码",
              //     ...HK_REPORT_TYPE_MAP[key as ReportType].headers
              //   ]);
              //   return value;
              // });
              // exportXlsx(`${DATA_PATH}/${code}.xlsx`, dataMap);
            });
          }, 100);
        })
      );
    });
    Promise.all(allPromise).then(allDataArr => {
      allDataArr.forEach(allDa => {
        _.mergeWith(
          allData,
          allDa,
          (objValue: XlsxData[], srcValue: XlsxData[]) => {
            const filterRes = srcValue.filter(
              row => typeof row[1] === "string" && row[1] > String(DEAL_YEAR)
            );
            return objValue.concat(filterRes);
          }
        );
      });

      // 加头
      Object.entries(allData).forEach(([key, value]) => {
        value.unshift([
          "股票代码",
          ...HK_REPORT_TYPE_MAP[key as ReportType].headers
        ]);
        return value;
      });
      exportXlsx(
        `${DATA_PATH}/hk_${new Date().toLocaleString()}.xlsx`,
        allData
      );
    });
  }
};
