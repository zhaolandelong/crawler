import _ from "lodash";
import { fetchData } from "./services";
import { HK_REPORT_TYPE_MAP } from "./constants";
import {
  ReportType,
  DEAL_YEAR,
  DATA_PATH,
  XlsxData,
  XlsxDataMap,
  StockObj
} from "../constants";
import { exportXlsx, mergeDataByStock } from "../utils";

export default {
  run(codeArr: StockObj[]): void {
    const allPromise: Promise<XlsxDataMap>[] = [];
    codeArr.forEach(({ code }) => {
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
                  const result = res.map(row => {
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
              //   value.unshift(HK_REPORT_TYPE_MAP[key as ReportType].headers);
              //   return value;
              // });
              // exportXlsx(`${DATA_PATH}/${code}.xlsx`, dataMap);
            });
          }, 100);
        })
      );
    });
    Promise.all(allPromise).then(allDataArr => {
      const allData = mergeDataByStock(
        allDataArr,
        row => typeof row[1] === "string" && row[1] > String(DEAL_YEAR)
      );

      // 加头
      Object.entries(allData).forEach(([key, value]) => {
        const headers = _.get(HK_REPORT_TYPE_MAP, `${key}.headers`);
        if (value && headers) {
          value.unshift(headers);
        }
        return value;
      });
      exportXlsx(
        `${DATA_PATH}/hk_${new Date().toLocaleString()}.xlsx`,
        allData
      );
    });
  },
  checkStock(code: string): boolean {
    return /\d{5}/.test(code);
  }
};
