import _ from "lodash";
import { CN_REPORT_TYPE_MAP } from "./constants";
import { fetchStandard, fetchOtherReport } from "./services";
import {
  ReportType,
  DEAL_YEAR,
  CURRENT_YEAR,
  DATA_PATH,
  XlsxDataMap,
  XlsxData
} from "../constants";
import { exportXlsx } from "../utils";
import { formatObj2ArrByHeader, dataFilterCallback } from "./utils";

export default {
  run(codeArr: string[]) {
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
            Object.keys(CN_REPORT_TYPE_MAP).forEach(key => {
              const reportType = key as ReportType;
              if (reportType === "standard") {
                promiseArr.push(
                  fetchStandard(code).then(res => {
                    const result = formatObj2ArrByHeader(
                      res.filter(row =>
                        dataFilterCallback(
                          row.reportdate,
                          DEAL_YEAR,
                          CURRENT_YEAR
                        )
                      ),
                      CN_REPORT_TYPE_MAP[reportType].headers
                    );
                    dataMap[reportType] = result;
                    return result;
                  })
                );
              } else {
                promiseArr.push(
                  fetchOtherReport({
                    code,
                    reportType
                  }).then(res => {
                    const result = formatObj2ArrByHeader(
                      res.filter(row =>
                        dataFilterCallback(
                          row.reportdate,
                          DEAL_YEAR,
                          CURRENT_YEAR
                        )
                      ),
                      CN_REPORT_TYPE_MAP[reportType].headers
                    );
                    dataMap[reportType] = result;
                    return result;
                  })
                );
              }
            });
            Promise.all(promiseArr).then(() => {
              rev(_.cloneDeep(dataMap));
              // 每个都生成单独的文件
              // 加头
              // Object.entries(dataMap).forEach(([key, value]) => {
              //   value.unshift(
              //     Object.values(CN_REPORT_TYPE_MAP[key as ReportType].headers)
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
      allDataArr.forEach(allDa => {
        _.mergeWith(
          allData,
          allDa,
          (objValue: XlsxData[], srcValue: XlsxData[]) =>
            objValue.concat(srcValue)
        );
      });
      // 加头
      Object.entries(allData).forEach(([key, value]) => {
        value.unshift(
          Object.values(CN_REPORT_TYPE_MAP[key as ReportType].headers)
        );
        return value;
      });
      exportXlsx(
        `${DATA_PATH}/cn_${new Date().toLocaleString()}.xlsx`,
        allData
      );
    });
  }
};
